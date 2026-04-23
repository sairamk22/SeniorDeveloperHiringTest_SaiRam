## Frontend Code Review Findings

1. **Potential XSS Vulnerability**  
   User input is being added to the DOM using innerHTML without any sanitization, which is risky. Someone could inject malicious scripts.It’s safer to use textContent or sanitize the input before displaying it.

2. **No Error Handling for Fetch Requests**  
   All fetch calls assume they’ll succeed. If something fails (like the API or network), the app won’t handle it and may just stop working without any explanation.

3. **No Input Validation**  
   User input is sent to the API as-is. This can lead to bad or unexpected data being stored and may cause backend issues. Basic validation would help prevent that.

4. **No User Feedback on Errors**  
   If something goes wrong, the user isn’t told. This can make the app feel broken. Showing simple error messages would improve the experience.

5. **Missing Content-Type Header**  
   POST requests don’t include Content-Type: application/json, which some APIs need to correctly process the data.

6. **No URL Encoding**  
   Query parameters aren’t encoded, so special characters could break requests. Using encodeURIComponent would fix this.

7. **No Empty State Handling**  
   When there’s no data, the UI is just blank. A message like “No expenses found” would make it clearer.

8. **Could Improve Readability with Async/Await**  
   The code uses .then() chains, which can get messy. async/await would make it easier to read and manage errors.