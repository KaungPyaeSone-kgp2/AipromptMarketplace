# Create Prompt Post

## Detailed Overview
The Create Prompt page (`/createpost`) is a complex, state-heavy form where creators draft, format, and publish their AI prompts. It includes advanced features like variable highlighting within the text editor and visibility toggles.

## Connected Files

### Frontend
- **`frontend/src/users/pages/CreatePrompt.jsx`**: The primary form file (over 500 lines).
  - **State Management**: Manages `formData` (title, description, content, categoryId, modelType, thumbnail, visibility), an array of `variables`, and a `previewImage`.
  - **Variable Highlighting**: Implements a clever "fake textarea" trick. The user types in a transparent `<textarea>`, while a `<div>` rendered directly behind it (`renderHighlightedContent()`) displays the text with variables wrapped in `<mark>` tags colored from a `PRESET_COLORS` palette.
  - **Visibility Options**: Allows setting the prompt to "public", "followers_only", or "draft".
  - **Edit Mode**: If a `promptId` parameter is present in the URL, the component mounts in edit mode, fetching the existing prompt via `fetchPromptById` and pre-filling the states.

### Backend
- **`backend/prompt/createPrompt.php`** (and `updatePrompt.php`): Endpoints that handle the multipart form data, saving the uploaded thumbnail image to the server, and storing the JSON-encoded prompt variables and text into the database.
## Step-by-Step Workflow
1. **Initialization**: On mount, it fetches available categories from the backend. If in edit mode, it also fetches the prompt data.
2. **Text Editing**: As the user types their prompt into the `content` textarea, they can highlight a word and click "Add Variable". The system registers the variable and assigns it a preset color.
3. **Synchronization**: A scrolling sync function (`handleScroll`) ensures that the transparent textarea and the highlighted backdrop `<div>` scroll perfectly together, maintaining the illusion of rich text editing.
4. **Submission**: The user selects a model type (e.g., ChatGPT, Midjourney), visibility status, attaches a thumbnail, and submits. The form data is validated, packaged into a `FormData` object (to support the image file), and sent to the backend.
