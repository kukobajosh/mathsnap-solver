# MathSnap - Visual Math Solver

A lightweight, client-side web application that solves mathematical equations from images using OCR.

## Features

- **Visual Input**: Upload images or use your device's camera.
- **Client-Side Processing**: Uses Tesseract.js for OCR and Math.js for calculation directly in the browser.
- **Clean UI**: Minimalist, distraction-free interface built with Tailwind CSS.
- **Instant Feedback**: Real-time analyzing states and clear solution presentation.

## Technologies

- **Vanilla JavaScript**: Core logic without framework overhead.
- **Tailwind CSS**: For modern, responsive styling (via CDN).
- **Tesseract.js**: For Optical Character Recognition (OCR).
- **Math.js**: For safe and powerful mathematical evaluation.

## How to Run

Since this is a static web application, you can serve it with any static file server.

### Using Python (if available)
```bash
python3 -m http.server 8080
```

### Using Node.js
```bash
npx serve .
```

Then open your browser to `http://localhost:8080`.

## Usage

1. Click the upload area or the "Use Camera" button.
2. Select an image containing a clear mathematical equation (e.g., "2 + 2" or "5 * 10").
3. Wait a moment for the AI to process the image.
4. View the detected equation and the calculated solution.