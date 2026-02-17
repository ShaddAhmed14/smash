# SMASH - Synthesis and Multimodal Analytics System for Humanities

## Overview

Preview Module
![smash_preview_gif](https://github.com/user-attachments/assets/bfb08a1d-25da-467a-bbb8-a210aca1b1a5)

Analysis Module
![smash_analysis_gif](https://github.com/user-attachments/assets/891b9658-8ca9-4a4e-92b6-04b6baa14b82)

Analytics Module
![smash_analytics_gif](https://github.com/user-attachments/assets/9bd0d9e4-b32c-4209-824f-ed2044b2fc54)

## Features
- Maskbench -> Model Results Video
- EnvisionHgDetector -> DTW Analysis | 
- Using Videos -> Wavs | Thumbnails
- Using Wavs -> Spectograms | Transcripts | Average Audio Features | Radial Graph
- Using Transcripts -> Video Cluster | Topic Interdistance | Data Map | Temporal Sentiment Analysis | Spacy Analysis | Semantic Network Analysis
- Using Spectograms -> Voronoi Graph

## 📦 Installation

Follow the instructions below to install and run experiments with SMASH:

1. **Install Docker** and ensure the daemon is running.
2. **Clone this repo**:
   ```bash
   git clone https://github.com/ShaddAhmed14/smash.git
   ```
3. **Switch to the git repository**
    ```bash
    cd smash
    ```
4. **Create the environment file**. This file is used to tell SMASH about your dataset, output and weights directory. Copy the .env file using:
    ```bash
    cp .env.dist .env
    ```
5. **Edit the .env file**. Open it using `vim .env` or `nano .env.`. Adjust the following variables:
6. Setup Materials following 
    * `MATERIALS_FOLDER:` This is where your materials are stored. For first time users, kindly follow [Setup ReadMe](/setup/readme.md) for details.
    * `ENVISIONHGDETECTOR_OUTPUT:` This is where setup will store envisionhgdetector results for further analysis.

    If running Setup:
    * `DATASET_FOLDER:` This folder contains your videos (.mp4). Kindly ensure you have more than 5 videos to allow clustering algorithms to work.
    * `MASKBENCH_OUTPUT_FOLDER:` Store your maskbench results here.
    * `HUGGINGFACE_API_KEY:` To use some models you need a HuggingFaceAPI key. You can get one from [here](https://huggingface.co/docs/hub/security-tokens).

    In case of port conflicts:
    * `FRONTEND_PORT:` If default frontend port is conflicting with other services, you can update the port here.
    * `BACKEND_PORT:` If default backend port is conflicting with other services, you can update the port here.
    * `NEXT_PUBLIC_BACKEND_URL:` By default SMASH runs on `localhost`. You can replace it with your server host name if needed.

7. **Build and run the SMASH Docker container**.
    ```bash
    docker compose build
    ```

    ```bash
    docker compose up
    ```
8. By default you can access SMASH on `localhost:3000`. General Link is `hostname:FRONTEND_PORT`

# 💻 Development

## Pull Requests & Contributions

We welcome contributions of all kinds—bug fixes, new features, documentation improvements, or tests.

Workflow:

1.	Fork the repository and create a new branch from main.
2.	Make changes following our coding style and commit with clear messages.
3.	Push your branch and open a Pull Request (PR) against main.
4.	In your PR description, explain the purpose, changes made, and any relevant issues (closes #123).
5.	Wait for review and address any comments and update your branch as needed.



## Commit Guideline
We use the [Conventional Commits Specification v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/#summary) for writing commit messages. Refer to the website for instructions.

### Commit Types

We use the recommended commit types from the specification, namely:

- `feat:` A code change that introduces a **new feature** to the codebase (this correlates with MINOR in Semantic Versioning)
- `fix:` A code change that **patches a bug** in your codebase (this correlates with PATCH in Semantic Versioning)
- `refactor:` A code change that **neither fixes a bug nor adds a feature**
- `build:` Changes that **affect the build system** or external dependencies (example scopes: pip, npm)
- `ci:` Changes to **CI configuration** files and scripts (examples: GitHub Actions)
- `docs:` **Documentation only** changes
- `perf:` A code change that **improves performance**
- `test:` Adding missing **tests** or correcting existing tests

### How should I voice the commit message?

- `feat:` commits: use the imperative, present tense – eg. `feat: add button` not `feat: added button` nor `feat: adds button`
- `fix:` commits: describe the bug that is being fixed – eg. `fix: button is broken` not `fix: repair broken button`

### What if I introduce a breaking change?

- Option 1): include an exclamation mark (`!`) after the commit type to draw attention to a breaking change
```
feat!: send an email to the customer when a product is shipped
```
- Option 2): include a breaking change footer
```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### What do I do if the commit conforms to more than one of the commit types?

Go back and make multiple commits whenever possible. Part of the benefit of Conventional Commits is its ability to drive us to make more organized commits and PRs.


# ⚖️ License
This project is licensed under the Mozilla Public License 2.0 (MPL 2.0). By using, modifying, or distributing this code, you agree to the terms of the MPL 2.0.
