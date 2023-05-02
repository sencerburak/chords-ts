# Interactive Guitar Chord Player

This project is an interactive guitar chord player built with React and TypeScript. Users can select notes and chords, and the application plays the corresponding sound using the Web Audio API. The project consists of several components and utility classes that handle the selection and playing of guitar chords.

The application is hosted on GitHub Pages and can be accessed [here](https://sencerburak.github.io/chords-ts/).

## Table of Contents

- [Components](#components)
- [Utility Classes](#utility-classes)
- [How to use](#how-to-use)
- [How to build](#how-to-build)
- [Customization](#customization)
- [License](#license)

## Components

- `NoteSelector.tsx`: A functional React component that displays a list of selectable notes. When a note is selected, the component calls a callback function with the selected note as its argument.
- `ChordSelector.tsx`: A functional React component that displays a list of selectable chords based on the selected note. When a chord is selected, the component calls a callback function with the selected chord as its argument.
- `Player.ts`: A class that handles playing chords on a virtual guitar using the Web Audio API. The class initializes an instance of the `WebAudioFontPlayer` and sets up the audio context and output. It has methods to play and cancel chords.

## Utility Classes

- `ChordShape`: Represents the shape of a chord on the guitar fretboard, including the finger positions on each string and any barre (if applicable).
- `Chord`: Represents a chord with its key, name, and an array of `ChordShape` objects.
- `ChordBook`: A class that holds an array of `Chord` objects and provides methods to retrieve chords by their key.
- `getChords`: An asynchronous function that returns a `Promise` resolving to a `ChordData` object containing the chord data.

## How to use

1. Clone the repository.
2. Install the required dependencies by running `npm install`.
3. Start the development server by running `npm run start`.
4. Open your browser and visit `http://localhost:8080/` to access the application.
5. Select a note and a chord to hear the corresponding sound.

## How to build

1. Clone the repository.
2. Install the required dependencies by running `npm install`.
3. Build the project by running `npm run build`.
4. The build files will be located in the `dist` folder.

## Customization

You can customize the list of available chords by modifying the `ChordBook.json` file. The JSON structure should follow the `ChordData` interface, with keys representing the chord keys and values being objects containing chord names and arrays of `ChordShapeData` objects.

## License

This project is available under the [ISC License](./LICENSE). Feel free to use, modify, and distribute the code as needed.
