Run Steps: 
backend:
    1. open terminal and cd into backend folder
    2. run "pip install -r requirements.txt"
    3. run "python seed_db.py" to seed the database
    4. run "uvicorn app.main:app --reload" to run the server on localhost:8000

frontend:
    1. open terminal and cd into frontend folder
    2. run "npm install"
    3. run "npm run dev" to run the server on localhost:3000


Tests:
    used http://localhost:8000/docs and http://localhost:8000/redoc to test the backend with fastAPI

    I made sure to test each individual function created by the ai properly in order to validate the outputs it gave. When i came to styling, the initial setup was good, but it was easier to manually modify any specific changes like centering and spacing as opposed to using the ai to change it.

Trade offs:


AI Prompts:
1. i need to make a project for a coding job interview, it involves making a react fronend website with a python backend, here is the specs: "Overview Build a small user registration app with a Python backend and a ReactJS frontend. The app will have: ● User registration with strict validation. ● User profile page (view and edit profile details). ● Welcome page that greets the user (e.g., “Hello, Ada!”) after login. Technical Constraints ● Frontend: React (TypeScript optional). Tailwind recommended. ● Backend: FastAPI or Flask with Pydantic/marshmallow. ● Password. ● SQLite for storage; seed via script."

2. "Profile Management: ○ Profile Page: After registration or login, users can view their details. ○ Edit Profile: Update first/last name. Email is read-only. ○ Backend routes: GET /api/profile, PUT /api/profile." update the backend to match the specific profile management requirements with the correct endpoints

3. Seed 10 fake users with @getcovered.io emails.

4. explain to me each part of the code and what everything does for the backend so far

5. Give me the frontend now, it will first display a registration/login page with these specifications: "Registration Form (React): ○ Fields: First name, Last name, Work email, Password, Confirm password. ○ Validate inline with clear messages. ○ Email must be @getcovered.io. ○ Password rules: ■ ≥ 12 characters ■ Uppercase, lowercase, number, symbol ■ No repeated characters (3+) ■ Differs from email local part by ≥ 5 chars ○ Submit disabled until valid."

next is the user profile page with these specifications: 
"Profile Management: ○ Profile Page: After registration or login, users can view their details. ○ Edit Profile: Update first/last name. Email is read-only. ○ Backend routes: GET /
api/profile, PUT /api/profile"

lastly the welcome page that will appear after login with these specifications: 
"Welcome Page: ○ After successful login or registration, redirect to a page saying: “Hello, [FirstName]!”."

6. These are the specs for the UI/UX: "UI/UX Expectations ● Modern, responsive layout. ● Inline error messages and success feedback. ● Password strength meter and show/hide toggle. ● Profile page: clean and simple, with editable fields and save button. ● Welcome page: minimal, visually pleasing greeting. ● Accessible: labels, roles, keyboard navigation."

7. Make sure Tailwind CSS is properly configured






