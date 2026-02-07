# HolyGraph

A web application for visualizing projects in graph form, inspired by the 42 school's project visualization system. Users can enter their own information (username, cursus ID, campus ID) and display their project graph.

## Features

- **User Input Form**: Enter your username, cursus ID, and campus ID
- **Dynamic URL Generation**: Automatically constructs the API fetch URL with your parameters
- **Graph Visualization**: Displays projects in an interactive graph format
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Shows a demo visualization if API is not accessible

## Usage

1. Open `index.html` in a web browser
2. Enter your information:
   - **Username/Login**: Your user login (e.g., "nadoho")
   - **Cursus ID**: Your cursus identifier (e.g., "21")
   - **Campus ID**: Your campus identifier (e.g., "1")
   - **API URL** (optional): The API endpoint URL (defaults to 42 intra)
3. Click "Generate Graph" to view your project visualization
4. The canvas element will display your project graph with the URL: `https://projects.intra.42.fr/project_data.json?cursus_id={your_cursus}&campus_id={your_campus}&login={your_username}`

## Example

For a user with:
- Username: `nadoho`
- Cursus ID: `21`
- Campus ID: `1`

The generated fetch URL will be:
```
https://projects.intra.42.fr/project_data.json?cursus_id=21&campus_id=1&login=nadoho
```

## Technical Details

The application consists of:
- **index.html**: Main page with input form and canvas element
- **styles.css**: Styling for the interface
- **script.js**: JavaScript logic for handling user input and graph visualization

### Canvas Element

The graph is rendered on a `<canvas>` element with:
- `data-fetch-url`: Dynamically set based on user input
- `data-quest`: Set to "42next"
- Responsive sizing

## Customization

You can customize the API URL to use with different project visualization systems. Simply modify the "API URL" field in the form or change the default value in `index.html`.

## Note

If the actual API is not accessible due to CORS restrictions or authentication requirements, the application will display a demo graph visualization to demonstrate the concept.

## License

MIT