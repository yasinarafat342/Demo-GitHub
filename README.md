1. What was the biggest challenge you faced while developing this project?
The biggest challenge was managing the Loading Spinner while fetching data from the API. Initially, the loader would not disappear even after the data was loaded. I solved this by using a try...catch...finally block in JavaScript, which ensures the loader is hidden as soon as the API response is received, whether it succeeds or fails.

2. Explain the process of fetching data from the API.
I used the JavaScript fetch() method with async/await to get data from the provided API link. First, I send a request to the server, then I convert the response into JSON format. After getting the data, I use the .map() method to create HTML cards dynamically and display them inside the dashboard container.

3. How does the search functionality work in your application?
The search functionality works by taking the user's input from the search box and sending it to the API's search endpoint. When the user clicks the "Search" button, a function is triggered that fetches only the issues matching that specific keyword. If the search box is empty, it automatically reloads all the issues.

4. How did you implement the dynamic top border colors for the cards?
To follow the Figma design, I used a conditional check inside my JavaScript code. While creating the cards, I check the status of each issue. If the status is "open", I add a Green border class (border-green-500), and if the status is "closed", I add a Purple/Magenta border class (border-purple-500) to the top of the card.

5. What steps did you take to improve the User Experience (UX)?
To make the app user-friendly, I added a loading spinner so users know data is being processed. I also implemented "Active Tab" highlighting to show which category (All, Open, or Closed) is currently selected. Additionally, I added hover effects on cards and used a Modal to show full details without leaving the page.