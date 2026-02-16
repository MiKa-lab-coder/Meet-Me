/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // Au cas où tu utilises un dossier src
    ],
    theme: {
        extend: {
            colors: {
                meetme: {
                    blue: '#3498db',
                    dark: '#2980b9',
                    green: '#82c91e',
                    light: '#f0f9ff',
                    red: '#f44336',
                    yellow: '#ffc107',
                },
            },
        },
    },
    plugins: [],
}