class WebAudioFontChannel {
    audioContext: AudioContext
    input: GainNode
    band32: BiquadFilterNode
    band64: BiquadFilterNode
    band128: BiquadFilterNode
    band256: BiquadFilterNode
    band512: BiquadFilterNode
    band1k: BiquadFilterNode
    band2k: BiquadFilterNode
    band4k: BiquadFilterNode
    band8k: BiquadFilterNode
    band16k: BiquadFilterNode
    output: GainNode

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext
        this.input = audioContext.createGain()
        this.band32 = this.bandEqualizer(this.input, 32)
        this.band64 = this.bandEqualizer(this.band32, 64)
        this.band128 = this.bandEqualizer(this.band64, 128)
        this.band256 = this.bandEqualizer(this.band128, 256)
        this.band512 = this.bandEqualizer(this.band256, 512)
        this.band1k = this.bandEqualizer(this.band512, 1024)
        this.band2k = this.bandEqualizer(this.band1k, 2048)
        this.band4k = this.bandEqualizer(this.band2k, 4096)
        this.band8k = this.bandEqualizer(this.band4k, 8192)
        this.band16k = this.bandEqualizer(this.band8k, 16384)
        this.output = audioContext.createGain()
        this.band16k.connect(this.output)
    }

    bandEqualizer(from: AudioNode, frequency: number): BiquadFilterNode {
        const filter = this.audioContext.createBiquadFilter()
        filter.frequency.setTargetAtTime(frequency, 0, 0.0001)
        filter.type = "peaking"
        filter.gain.setTargetAtTime(0, 0, 0.0001)
        filter.Q.setTargetAtTime(1.0, 0, 0.0001)
        from.connect(filter)
        return filter
    }
}


interface Preset {
    zones: {
        buffer?: AudioBuffer
    }[]
}

class WebAudioFontLoader {
    player: any
    cached: any[]
    instrumentKeyArray: String[]
    instrumentNamesArray: String[]
    choosenInfos: [number, number][]
    drumNamesArray: String[]
    drumKeyArray: String[]
    constructor(player: any) {
        this.player = player
        this.cached = []
        this.instrumentKeyArray = []
        this.instrumentNamesArray = []
        this.choosenInfos = []
        this.drumNamesArray = []
        this.drumKeyArray = []
    }
    startLoad(audioContext: AudioContext, filePath: any, variableName: any) {
        if (window[variableName]) {
            return
        }
        for (var i = 0; i < this.cached.length; i++) {
            if (this.cached[i].variableName == variableName) {
                return
            }
        }
        this.cached.push({
            filePath: filePath,
            variableName: variableName
        })
        var r = document.createElement('script')
        r.setAttribute("type", "text/javascript")
        r.setAttribute("src", filePath)
        document.getElementsByTagName("head")[0].appendChild(r)
        this.decodeAfterLoading(audioContext, variableName)
    }

    decodeAfterLoading(audioContext: AudioContext, variableName: any) {
        var me = this
        this.waitOrFinish(variableName, function () {
            me.player.adjustPreset(audioContext, window[variableName])
        })
    }

    waitOrFinish(variableName: any, onFinish: any) {
        if (window[variableName]) {
            onFinish()
        }
        else {
            var me = this
            setTimeout(function () {
                me.waitOrFinish(variableName, onFinish)
            }, 111)
        }
    }

    loaded(variableName: any) {
        if (!(window[variableName])) {
            return false
        }
        const preset = (window as any)[variableName] as Preset
        for (var i = 0; i < preset.zones.length; i++) {
            if (!(preset.zones[i].buffer)) {
                return false
            }
        }
        return true
    }

    progress() {
        if (this.cached.length > 0) {
            for (var k = 0; k < this.cached.length; k++) {
                if (!this.loaded(this.cached[k].variableName)) {
                    return k / this.cached.length
                }
            }
            return 1
        }
        else {
            return 1
        }
    }

    waitLoad(onFinish: any) {
        var me = this
        if (this.progress() >= 1) {
            onFinish()
        }
        else {
            setTimeout(function () {
                me.waitLoad(onFinish)
            }, 333)
        }
    }
}

export class WebAudioFontPlayer {
    envelopes: any[]
    loader: WebAudioFontLoader
    afterTime: number
    nearZero: number

    constructor() {
        this.envelopes = []
        this.loader = new WebAudioFontLoader(this)
        this.afterTime = 0.05
        this.nearZero = 0.000001
    }

    adjustPreset(audioContext: AudioContext, preset: any) {
        for (let i = 0; i < preset.zones.length; i++) {
            this.adjustZone(audioContext, preset.zones[i])
        }
    }

    async adjustZone(audioContext: AudioContext, zone: any) {
        if (zone.buffer) {
            //
        } else {
            zone.delay = 0
            if (zone.sample) {
                const decoded = atob(zone.sample)
                zone.buffer = audioContext.createBuffer(1, decoded.length / 2, zone.sampleRate)
                const float32Array = zone.buffer.getChannelData(0)
                let b1, b2, n
                for (let i = 0; i < decoded.length / 2; i++) {
                    b1 = decoded.charCodeAt(i * 2)
                    b2 = decoded.charCodeAt(i * 2 + 1)
                    if (b1 < 0) {
                        b1 = 256 + b1
                    }
                    if (b2 < 0) {
                        b2 = 256 + b2
                    }
                    n = b2 * 256 + b1
                    if (n >= 65536 / 2) {
                        n = n - 65536
                    }
                    float32Array[i] = n / 65536.0
                }
            } else {
                if (zone.file) {
                    const datalen = zone.file.length
                    const arraybuffer = new ArrayBuffer(datalen)
                    const view = new Uint8Array(arraybuffer)
                    const decoded = atob(zone.file)
                    let b
                    for (let i = 0; i < decoded.length; i++) {
                        b = decoded.charCodeAt(i)
                        view[i] = b
                    }
                    const audioBuffer = audioContext.createBuffer(1, decoded.length / 2, zone.sampleRate)
                    zone.buffer = audioBuffer
                    await audioContext.decodeAudioData(arraybuffer, (audioBuffer) => {
                        zone.buffer = audioBuffer
                    })
                }
            }
            zone.loopStart = this.numValue(zone.loopStart, 0)
            zone.loopEnd = this.numValue(zone.loopEnd, 0)
            zone.coarseTune = this.numValue(zone.coarseTune, 0)
            zone.fineTune = this.numValue(zone.fineTune, 0)
            zone.originalPitch = this.numValue(zone.originalPitch, 6000)
            zone.sampleRate = this.numValue(zone.sampleRate, 44100)
            zone.sustain = this.numValue(zone.originalPitch, 0)
        }
    }

    numValue(value: any, defaultValue: number) {
        if (typeof value === 'number') {
            return value
        } else {
            return defaultValue
        }
    }

    createChannel(audioContext: AudioContext) {
        return new WebAudioFontChannel(audioContext)
    }
    limitVolume(volume: number) {
        if (volume) {
            volume = 1.0 * volume
        }
        else {
            volume = 0.5
        }
        return volume
    }

    queueChord(audioContext: AudioContext, target: any, preset: any, when: any, pitches: string | any[], duration: any, volume: number, slides: any[]) {
        console.debug('queueChord', pitches)
        volume = this.limitVolume(volume)
        var envelopes = []
        for (var i = 0; i < pitches.length; i++) {
            var singleSlide = undefined
            if (slides) {
                singleSlide = slides[i]
            }

            var envlp = this.queueWaveTable(audioContext, target, preset, when, pitches[i], duration, volume - Math.random() * 0.01, singleSlide)
            if (envlp)
                envelopes.push(envlp)
        }
        console.debug('envelopes', envelopes)
        return envelopes
    }

    queueStrumUp(audioContext: any, target: any, preset: any, when: any, pitches: any[], duration: any, volume: any, slides: any) {
        pitches.sort(function (a: number, b: number) {
            return b - a
        })
        return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides)
    }

    queueStrumDown(audioContext: any, target: any, preset: any, when: any, pitches: any[], duration: any, volume: any, slides: any) {
        pitches.sort(function (a: number, b: number) {
            return a - b
        })
        return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides)
    }

    queueStrum(audioContext: AudioContext, target: any, preset: any, when: number, pitches: string | any[], duration: any, volume: number, slides: any[]) {
        volume = this.limitVolume(volume)
        if (when < audioContext.currentTime) {
            when = audioContext.currentTime
        }
        var envelopes = []
        for (var i = 0; i < pitches.length; i++) {
            var singleSlide = undefined
            if (slides) {
                singleSlide = slides[i]
            }
            var envlp = this.queueWaveTable(audioContext, target, preset, when + i * 0.01, pitches[i], duration, volume - Math.random() * 0.01, singleSlide)
            if (envlp)
                envelopes.push(envlp)
            volume = 0.9 * volume
        }
        return envelopes
    }

    queueSnap(audioContext: any, target: any, preset: any, when: any, pitches: any, duration: number, volume: number, slides: any) {
        volume = this.limitVolume(volume)
        volume = 1.5 * (volume || 1.0)
        duration = 0.05
        return this.queueChord(audioContext, target, preset, when, pitches, duration, volume, slides)
    }

    resumeContext(audioContext: { state: string; resume: () => void; }) {
        try {
            if (audioContext.state == 'suspended') {
                console.log('audioContext.resume', audioContext)
                audioContext.resume()
            }
        }
        catch (e) {
            //don't care
        }
    }
    async queueWaveTable(audioContext: AudioContext, target: any, preset: any, when: any, pitch: number, duration: any, volume: any, slides: string | any[]) {
        this.resumeContext(audioContext)
        volume = this.limitVolume(volume)
        var zone = await this.findZone(audioContext, preset, pitch)
        if (zone) {
            if (!(zone.buffer)) {
                console.log('empty buffer ', zone)
                return null
            }
            var baseDetune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune
            var playbackRate = 1.0 * Math.pow(2, (100.0 * pitch - baseDetune) / 1200.0)
            var startWhen = when
            if (startWhen < audioContext.currentTime) {
                startWhen = audioContext.currentTime
            }
            var waveDuration = duration + this.afterTime
            var loop = true
            if (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) {
                loop = false
            }
            if (!loop) {
                if (waveDuration > zone.buffer.duration / playbackRate) {
                    waveDuration = zone.buffer.duration / playbackRate
                }
            }
            var envelope = this.findEnvelope(audioContext, target)
            this.setupEnvelope(audioContext, envelope, zone, volume, startWhen, waveDuration, duration)
            envelope.audioBufferSourceNode = audioContext.createBufferSource()
            envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, 0)
            if (slides) {
                if (slides.length > 0) {
                    envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, when)
                    for (var i = 0; i < slides.length; i++) {
                        var nextPitch = pitch + slides[i].delta
                        var newPlaybackRate = 1.0 * Math.pow(2, (100.0 * nextPitch - baseDetune) / 1200.0)
                        var newWhen = when + slides[i].when
                        envelope.audioBufferSourceNode.playbackRate.linearRampToValueAtTime(newPlaybackRate, newWhen)
                    }
                }
            }
            envelope.audioBufferSourceNode.buffer = zone.buffer
            if (loop) {
                envelope.audioBufferSourceNode.loop = true
                envelope.audioBufferSourceNode.loopStart = zone.loopStart / zone.sampleRate + ((zone.delay) ? zone.delay : 0)
                envelope.audioBufferSourceNode.loopEnd = zone.loopEnd / zone.sampleRate + ((zone.delay) ? zone.delay : 0)
            }
            else {
                envelope.audioBufferSourceNode.loop = false
            }
            envelope.audioBufferSourceNode.connect(envelope)
            envelope.audioBufferSourceNode.start(startWhen, zone.delay)
            envelope.audioBufferSourceNode.stop(startWhen + waveDuration)
            envelope.when = startWhen
            envelope.duration = waveDuration
            envelope.pitch = pitch
            envelope.preset = preset
            return envelope
        }
        else {
            return null
        }
    }

    noZeroVolume(n: number) {
        if (n > this.nearZero) {
            return n
        }
        else {
            return this.nearZero
        }
    }

    setupEnvelope(audioContext: AudioContext, envelope: any, zone: { ahdsr: any; }, volume: number, when: number, sampleDuration: number, noteDuration: any) {
        envelope.gain.setValueAtTime(this.noZeroVolume(0), audioContext.currentTime)
        var lastTime = 0
        var lastVolume = 0
        var duration = noteDuration
        var zoneahdsr = zone.ahdsr
        if (sampleDuration < duration + this.afterTime) {
            duration = sampleDuration - this.afterTime
        }
        if (zoneahdsr) {
            if (!(zoneahdsr.length > 0)) {
                zoneahdsr = [{
                    duration: 0,
                    volume: 1
                }, {
                    duration: 0.5,
                    volume: 1
                }, {
                    duration: 1.5,
                    volume: 0.5
                }, {
                    duration: 3,
                    volume: 0
                }
                ]
            }
        }
        else {
            zoneahdsr = [{
                duration: 0,
                volume: 1
            }, {
                duration: duration,
                volume: 1
            }
            ]
        }
        var ahdsr = zoneahdsr
        envelope.gain.cancelScheduledValues(when)
        envelope.gain.setValueAtTime(this.noZeroVolume(ahdsr[0].volume * volume), when)
        for (var i = 0; i < ahdsr.length; i++) {
            if (ahdsr[i].duration > 0) {
                if (ahdsr[i].duration + lastTime > duration) {
                    var r = 1 - (ahdsr[i].duration + lastTime - duration) / ahdsr[i].duration
                    var n = lastVolume - r * (lastVolume - ahdsr[i].volume)
                    envelope.gain.linearRampToValueAtTime(this.noZeroVolume(volume * n), when + duration)
                    break
                }
                lastTime = lastTime + ahdsr[i].duration
                lastVolume = ahdsr[i].volume
                envelope.gain.linearRampToValueAtTime(this.noZeroVolume(volume * lastVolume), when + lastTime)
            }
        }
        envelope.gain.linearRampToValueAtTime(this.noZeroVolume(0), when + duration + this.afterTime)
    }

    findEnvelope(audioContext: AudioContext, target: any) {
        var envelope: any | null = null
        for (var i = 0; i < this.envelopes.length; i++) {
            var e = this.envelopes[i]
            if (e.target == target && audioContext.currentTime > e.when + e.duration + 0.001) {
                try {
                    if (e.audioBufferSourceNode) {
                        e.audioBufferSourceNode.disconnect()
                        e.audioBufferSourceNode.stop(0)
                        e.audioBufferSourceNode = null
                    }
                }
                catch (x) {
                    //audioBufferSourceNode is dead already
                }
                envelope = e
                break
            }
        }
        if (!(envelope)) {
            envelope = audioContext.createGain()
            envelope.target = target
            envelope.connect(target)
            envelope.cancel = function () {
                if (envelope && (envelope.when + envelope.duration > audioContext.currentTime)) {
                    envelope.gain.cancelScheduledValues(0)
                    envelope.gain.setTargetAtTime(0.00001, audioContext.currentTime, 0.1)
                    envelope.when = audioContext.currentTime + 0.00001
                    envelope.duration = 0
                }
            }
            this.envelopes.push(envelope)
        }
        return envelope
    }

    async findZone(audioContext: AudioContext, preset: { zones: any[]; }, pitch: number) {
        var zone = null
        for (var i = preset.zones.length - 1; i >= 0; i--) {
            zone = preset.zones[i]
            if (zone.keyRangeLow <= pitch && zone.keyRangeHigh + 1 >= pitch) {
                break
            }
        }
        await this.adjustZone(audioContext, zone)

        return zone
    }

    cancelQueue(audioContext: AudioContext) {
        for (var i = 0; i < this.envelopes.length; i++) {
            var e = this.envelopes[i]
            e.gain.cancelScheduledValues(0)
            e.gain.setValueAtTime(this.nearZero, audioContext.currentTime)
            e.when = -1
            try {
                if (e.audioBufferSourceNode)
                    e.audioBufferSourceNode.disconnect()
            }
            catch (ex) {
                console.log(ex)
            }
        }
    }
}
