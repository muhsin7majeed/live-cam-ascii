# Live Camera to ASCII Art

A real-time webcam to ASCII art converter built with vanilla JavaScript. This application captures video from your camera and converts each frame to ASCII characters in real-time, allowing you to see yourself (or anything in front of your camera) as ASCII art.

## Features

- **Real-time Conversion**: Live video feed converted to ASCII art frame-by-frame
- **Customizable ASCII Characters**: Adjust the character set used for conversion (dark to light)
- **Adjustable Detail Levels**: Control the resolution/detail of ASCII output (5 levels)
- **Camera Flip**: Mirror the camera view horizontally
- **Export Options**:
  - Save ASCII art as text file (`.txt`)
  - Save ASCII art as image file (`.png`)
  - Record ASCII art as video file (`.webm` or `.mp4`)
- **Modern UI**: Clean, responsive interface with collapsible settings

## How It Works

The application uses the following process to convert video frames to ASCII:

1. **Camera Access**: Uses the `MediaDevices.getUserMedia()` API to access the user's webcam
2. **Frame Capture**: Each video frame is drawn to an off-screen HTML5 Canvas
3. **Pixel Analysis**: The canvas image data is analyzed pixel-by-pixel to calculate brightness
4. **ASCII Mapping**: Each pixel's brightness is mapped to an ASCII character from a character ramp (dark pixels → light characters)
5. **Rendering**: The resulting ASCII string is displayed in a `<pre>` element and updated continuously using `requestAnimationFrame`

## Project Structure

```
live-cam-ascii/
├── index.html          # Main HTML file with UI structure
├── css/
│   └── styles.css      # Styling for the application
├── js/
│   ├── main.js         # Main application entry point and event handlers
│   ├── constants.js    # Configuration constants
│   ├── camera.js       # Camera access and management
│   ├── renderer.js     # ASCII rendering loop management
│   └── utils/
│       ├── asciiConverter.js  # Core ASCII conversion logic
│       ├── canvasUtils.js     # Canvas manipulation utilities
│       └── fileUtils.js      # File export functionality (text, image, video)
└── README.md          # This file
```

## Code Architecture

### Main Entry Point (`main.js`)

The main file orchestrates the entire application:

- **DOM Element References**: Gets references to all UI elements
- **State Management**: Manages ASCII ramp, renderer instance, and video recorder
- **Event Handlers**: Sets up listeners for:
  - Settings toggle
  - ASCII character input changes
  - Camera flip toggle
  - Detail level slider
  - Capture buttons (text, image, video)
- **Camera Initialization**: Calls `initializeCamera()` and handles success/error callbacks
- **Renderer Setup**: Creates and manages the `ASCIIRenderer` instance

### Camera Module (`camera.js`)

Handles all camera-related operations:

- **`initializeCamera()`**: Requests camera access via `getUserMedia()` and sets up the video stream
- **`stopCamera()`**: Stops the camera stream and releases resources
- **`isCameraAvailable()`**: Checks if camera API is available in the browser

### Renderer Module (`renderer.js`)

Manages the real-time rendering loop:

- **`ASCIIRenderer` Class**: 
  - Creates an off-screen canvas for processing
  - Manages the `requestAnimationFrame` loop
  - Handles canvas size updates for detail levels
  - Supports horizontal flipping
  - Converts video frames to ASCII and updates the display

### ASCII Converter (`utils/asciiConverter.js`)

Core conversion logic:

- **`convertToASCII()`**: Main conversion function that:
  - Takes image data, dimensions, and character ramp
  - Iterates through each pixel
  - Calculates average RGB brightness
  - Maps brightness to ASCII character index
  - Builds the ASCII string line by line

### Canvas Utilities (`utils/canvasUtils.js`)

Canvas manipulation helpers:

- **`createCanvas()`**: Creates and configures a canvas element
- **`drawVideoToCanvas()`**: Draws video frame to canvas (with optional horizontal flip)
- **`getImageData()`**: Extracts pixel data from canvas

### File Utilities (`utils/fileUtils.js`)

Export functionality:

- **`saveAsciiToFile()`**: Saves ASCII text as a `.txt` file
- **`saveAsciiToImage()`**: Renders ASCII text to canvas and saves as `.png` image
- **`ASCIIVideoRecorder` Class**: Records ASCII art as video:
  - Sets up canvas for video rendering
  - Uses `MediaRecorder` API to capture frames
  - Supports multiple video codecs (VP9, VP8, MP4)
  - Records at configurable frame rate (default: 30fps)

### Constants (`constants.js`)

Centralized configuration:

- Canvas dimensions (default: 160x120)
- Default ASCII character ramp: `" .:-=+*#%@"`
- Camera constraints
- Error messages

## Usage

### Running Locally

1. **Using a Local Server** (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using Vite (if installed)
   npx vite
   ```

2. Open your browser and navigate to `http://localhost:8000` (or the port your server uses)

3. **Grant Camera Permissions**: When prompted, allow the browser to access your camera

4. **Adjust Settings** (optional):
   - Click the settings button (⚙️) to reveal controls
   - Modify ASCII characters for different visual styles
   - Adjust detail level slider (1 = low detail/fast, 5 = high detail/slower)
   - Toggle camera flip if desired

5. **Export Your Art**:
   - **Capture as text**: Downloads current ASCII art as `.txt` file
   - **Capture as image**: Downloads current ASCII art as `.png` image
   - **Record video**: Click to start recording, click again to stop and download

### Browser Requirements

- **Modern browser** with support for:
  - ES6+ JavaScript (const/let, arrow functions, classes, modules)
  - HTML5 Canvas API
  - MediaDevices API (`getUserMedia`)
  - MediaRecorder API (for video recording)
  - ES6 Modules

- **Recommended browsers**:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+

- **HTTPS or localhost**: Camera access requires a secure context (HTTPS) or localhost

## Technical Details

### Performance Optimizations

- **Small Canvas Size**: Default processing canvas is 160x120 pixels (adjustable via detail slider)
- **Efficient Rendering**: Uses `requestAnimationFrame` for smooth, browser-optimized animation
- **Single DOM Update**: ASCII text is updated once per frame in a single operation
- **Off-screen Processing**: All image processing happens on an off-screen canvas

### Detail Levels

The detail slider controls both canvas size and font size:

- **Level 1**: 80×60 pixels, 0.5rem font
- **Level 2**: 160×120 pixels, 0.25rem font (default)
- **Level 3**: 240×180 pixels, 0.167rem font
- **Level 4**: 320×240 pixels, 0.125rem font
- **Level 5**: 400×300 pixels, 0.1rem font

Font size scales inversely to maintain consistent visual size while increasing detail.

### ASCII Character Mapping

The application maps pixel brightness (0-255) to ASCII characters:

- **Brightness Calculation**: Average of RGB values `(R + G + B) / 3`
- **Character Selection**: `Math.floor((brightness / 255) * (rampLength - 1))`
- **Default Ramp**: `" .:-=+*#%@"` (space = darkest, @ = lightest)

You can customize the character ramp in the settings. Characters should be ordered from dark (low brightness) to light (high brightness).

### Video Recording

The video recorder:

- Creates a canvas stream using `canvas.captureStream()`
- Uses `MediaRecorder` API to encode frames
- Automatically selects the best supported codec (VP9 → VP8 → WebM → MP4)
- Records at 30fps with 2.5 Mbps bitrate
- Saves as `.webm` or `.mp4` depending on browser support

## Customization

### Changing Default ASCII Characters

Edit `js/constants.js`:

```javascript
export const DEFAULT_ASCII_RAMP = " .:-=+*#%@";
```

### Adjusting Default Canvas Size

Edit `js/constants.js`:

```javascript
export const CANVAS_CONFIG = {
  WIDTH: 160,
  HEIGHT: 120,
};
```

### Modifying Styling

Edit `css/styles.css` to change colors, fonts, layout, etc.

## Browser Compatibility Notes

- **Camera Access**: Requires user permission and HTTPS (or localhost)
- **Video Recording**: Codec support varies by browser:
  - Chrome/Edge: VP9, VP8, WebM
  - Firefox: VP9, VP8, WebM
  - Safari: Limited support, may fall back to MP4

## License

This project is open source and available for personal and commercial use.

## Author

Created by Muhsin A

---

**Note**: This application requires camera access. Make sure to grant permissions when prompted, and ensure you're using HTTPS or localhost for the application to work properly.

