# 🚀 HackToFuture 3.0 Repository Setup Guide
#### To track your progress and collaborate effectively, every team must fork the official repository and follow the steps below.
<br>

# 🔱 Fork the Repository
 #### Go to the GitHub page https://github.com/HackToFuture/HTF-XNN <br>
  #### Click on the "Fork" button in the upper-right corner of the page.
  #### Assign the repository name as "HTF - *<Team_Code>*".

  <img align="center" width = "500" src = "https://docs.github.com/assets/cb-40742/mw-1440/images/help/repository/fork-button.webp" alt="fork image"/>
  
  
  ```
  Example :
  <Team_Code> -> A09
  Repository Name : HTF-A09
```

# 📥 Clone Your Forked Repository
  #### Go to your forked repository on GitHub.
  #### Click the green "Code" button, then click the clipboard icon to copy the URL.

   <img align="center" width = "500" height="200" src = "https://docs.github.com/assets/cb-60499/mw-1440/images/help/repository/https-url-clone-cli.webp" alt="clone image"/>
 
  #### Open your terminal and run the following git clone command to copy the repository to your local machine.
  #### Replace *repository-url* with the URL of your forked repository.
  ```
  git clone <repository-url>
```


# 🛠️ Start working on your project
#### Begin building your solution! Collaborate with your teammates and push changes regularly.

# 📝 Commit Your Changes
#### Track and save your progress using Git:
#### Check the status of your changes
   ```
    git status
 ```
  

  #### Use the git add command to stage the changes you want to commit
  ```
    git add .
 ```
      
  #### Commit with a meaningful message
  #### *Option 1* : Simple Commit Format (Beginner Friendly)
  #### Use this if you're new to Git
   ```
    git commit -m "Your descriptive commit message"
 ```
#### *Option 2* : Conventional Commits (Recommended)
#### Follow this format for more structured, professional commit history  
```
git commit -m "<type>(<scope>): <subject>"
```
| Type | Purpose |
|----------|----------|
| feat    | for a new feature for the user, not a new feature for build script. Such commit will trigger a release bumping a MINOR version    |
| fix    | for a bug fix for the user, not a fix to a build script. Such commit will trigger a release bumping a PATCH version     |
| perf    | for performance improvements. Such commit will trigger a release bumping a PATCH version    |
| docs    | for changes to the documentation     |
| test | for adding missing tests, refactoring tests; no production code change  |
| style  | for formatting changes, missing semicolons, etc  |
| refactor | for refactoring production code, e.g. renaming a variable  |
| build | for updating build configuration, development tools or other changes irrelevant to the user|

#### Scope: Area of change (e.g., api, ui, auth)
#### Subject: One-line summary in present tense, no period at the end

```
Example: git commit -m "fix(button): fix submit button not working"
```

# 🚀 Push Your Changes
  #### Send your local commits to GitHub:
  ```
    git push origin
 ```
# 🧠 Tips
#### *Commit often* : Small, frequent commits help track progress and fix bugs easily.
#### *Write clear messages* : Describe what you did in each commit.
#### *Collaborate* : Make sure everyone in your team contributes.

---

**For any issues or doubts, reach out to the organizing team.** *Happy hacking!* 💻✨

# Aura - AI Assistant with Voice Wake-Up

Aura is an AI assistant that can be awakened with a voice command and responds with speech synthesis.

## Features

- Voice wake-up command: "Aura, Arise!"
- Speech synthesis for Aura's responses
- Beautiful animated UI
- FastAPI backend for speech recognition
- React frontend with TypeScript

## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Click "Start Listening" to begin voice recognition
3. Say "Aura, Arise!" to wake up Aura
4. After Aura responds, you'll be taken to the configuration page

## API Endpoints

- `POST /api/start-session`: Start a new speech recognition session
- `POST /api/process-audio/{session_id}`: Process an audio chunk
- `POST /api/stop-session/{session_id}`: Stop a speech recognition session
- `GET /api/get-results/{session_id}`: Get current results for a session

## Technologies Used

- **Backend**: FastAPI, AssemblyAI, Python
- **Frontend**: React, TypeScript, Framer Motion, Tailwind CSS
- **Speech Recognition**: AssemblyAI API
- **Speech Synthesis**: Web Speech API
