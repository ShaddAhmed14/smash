# NWO Report Sections — Draft

> These drafts can be used for both the **voortgangsverslag** (progress report) and **eindverslag** (final report). Sections are written in English; translate to Dutch as needed for submission.

---

## 1. Samenvatting van de voortgang / resultaten

SMASH (Synthesis and Multimodal Analytics System for Humanities) has progressed from concept to a fully functional open-source platform for multimodal communication analysis. The system is operational for Goal 1 (pilot TED Talks corpus) and architecturally prepared for Goal 2 (scaling to 3,000+ videos).

### Key achievements to date

- **9 analysis modules** implemented and integrated: audio feature extraction (librosa), prosody analysis (openSMILE eGeMAPS, 88 features), pause & filler detection, facial expression analysis (py-feat: 7 emotions + 16 Action Units), visual embedding analysis (DINOv2 ViT), gesture kinematic analysis (EnvisionHGDetector + DTW), topic modeling (BERTopic with Sentence-BERT + UMAP + HDBSCAN), semantic network analysis (TF-IDF and SBERT), and temporal sentiment tracking (NLTK VADER).
- **FAIR-compliant database** built with SQLAlchemy and SQLite, featuring Dublin Core metadata, ISO 639-1 language codes, per-record provenance tracking (tool versions, parameters, timestamps), and persistent identifiers.
- **Researcher-facing export API** with 8 endpoints supporting CSV and JSON output: corpus descriptives (paper Table 1 format), time-aligned multimodal streams, NumPy embeddings, provenance metadata, and filtered corpus subsets.
- **Web-based frontend** with three modules (Preview, Analysis, Analytics) providing interactive visualizations without requiring programming experience — fulfilling a core project objective.
- **Comprehensive test suite** (1,914 lines, 40+ test cases) covering database operations, ingestion pipeline, API endpoints, and end-to-end integration with synthetic data.
- **Deployment infrastructure**: Docker Compose for reproducible deployment; MIT open-source license; published on GitHub.

### Risico's en belemmeringen (Risks and obstacles)

1. **Pose estimation model compatibility**: Integrating multiple pose estimation backends (YoloPose, MediaPipe, OpenPose, MaskAnyoneAPI) required substantial engineering effort due to differing output formats and coordinate systems. This was resolved by implementing a unified kinematic feature extraction pipeline that normalizes outputs across models.

2. **Scaling considerations for Goal 2**: Processing 3,000+ videos requires significant compute resources, particularly for facial expression analysis (py-feat) and visual embeddings (DINOv2). We addressed this by implementing frame-skipping strategies (processing at ~2 FPS instead of full frame rate) and modular processing that allows each analysis step to run independently, enabling parallelization.

3. **Data format heterogeneity**: The initial file-based approach (JSON/CSV per video) created complexity for cross-corpus queries. This was resolved by designing the FAIR-compliant SQLite database with indexed summary statistics, enabling efficient filtering and aggregation across the corpus.

4. **Speaker diarization accuracy**: Initial experiments with pyannote for multi-speaker scenarios showed variable accuracy. This remains an area for improvement, particularly for videos with overlapping speech or non-English content.

### Kansen (Opportunities)

1. **DINOv2 model reuse**: We discovered that the same DINOv2 ViT-S/16 model could serve dual purposes — both spectrogram similarity analysis and visual keyframe embeddings — reducing memory overhead and creating a unified visual feature space.

2. **Carbon Design System adoption**: Migrating the frontend to IBM's Carbon Design System improved UI consistency and accessibility, making the platform more suitable for researchers without technical backgrounds.

3. **Export API for reproducibility**: The researcher-facing export endpoints were not originally planned at this level of detail, but emerged as a natural extension of the FAIR database design. These endpoints now support paper supplementary materials, data archiving (DANS/Zenodo), and reproducibility packages.

### Planning status

| Component | Status | Notes |
|-----------|--------|-------|
| Audio extraction & transcription (Whisper) | Complete | Operational for Goal 1 corpus |
| Prosody analysis (eGeMAPS) | Complete | 88 features per video |
| Pause & filler detection | Complete | Speech rate, silence detection |
| Facial expression analysis (py-feat) | Complete | 7 emotions + 16 AUs |
| Visual embedding analysis (DINOv2) | Complete | 384-dim embeddings, clustering |
| Gesture kinematic analysis | Complete | DTW, amplitude, velocity, smoothness |
| Topic modeling (BERTopic) | Complete | Cross-corpus topic distribution |
| Semantic network analysis | Complete | TF-IDF and SBERT variants |
| Temporal sentiment (VADER) | Complete | Per-segment sliding window |
| FAIR database & ingestion | Complete | Dublin Core, provenance tracking |
| Export API | Complete | 8 endpoints, CSV/JSON/NumPy |
| Frontend (3 modules) | Complete | Preview, Analysis, Analytics |
| Test suite | Complete | 1,914 lines, 40+ test cases |
| Scaling to 3,000+ videos (Goal 2) | In progress | Architecture ready; batch processing pipeline under development |

---

## 2. Publiekssamenvatting (Public summary)

**English:**

SMASH (Synthesis and Multimodal Analytics System for Humanities) is an open-source platform that helps researchers understand how people communicate beyond words. When we give a presentation, teach a class, or deliver a speech, our message is conveyed not just through language, but through gestures, facial expressions, voice tone, and body posture. SMASH makes it possible to study all these communication channels simultaneously.

The platform takes video recordings as input and automatically analyzes multiple aspects of communication: what is being said (speech transcription and topic analysis), how it is being said (voice prosody, pauses, speech rate), and what the body is doing (facial expressions, hand gestures, posture). All results are presented through an interactive web interface that requires no programming experience, making multimodal communication research accessible to a broader community of scholars in the humanities and social sciences.

Developed at the Donders Institute for Brain, Cognition and Behaviour (Radboud University) in partnership with Hasso Plattner Institute, SMASH is built on FAIR data principles — ensuring that research data is Findable, Accessible, Interoperable, and Reusable. The platform is freely available as open-source software, supporting transparent and reproducible science.

**Nederlands:**

SMASH (Synthesis and Multimodal Analytics System for Humanities) is een open-source platform dat onderzoekers helpt te begrijpen hoe mensen communiceren voorbij woorden. Wanneer we een presentatie geven, lesgeven of een toespraak houden, wordt onze boodschap niet alleen via taal overgebracht, maar ook via gebaren, gezichtsuitdrukkingen, stemtoon en lichaamshouding. SMASH maakt het mogelijk al deze communicatiekanalen tegelijkertijd te bestuderen.

Het platform neemt video-opnames als input en analyseert automatisch meerdere aspecten van communicatie: wat er wordt gezegd (spraaktranscriptie en onderwerpanalyse), hoe het wordt gezegd (stemprosody, pauzes, spreeksnelheid), en wat het lichaam doet (gezichtsuitdrukkingen, handgebaren, houding). Alle resultaten worden gepresenteerd via een interactieve webinterface die geen programmeerervaring vereist, waardoor multimodaal communicatieonderzoek toegankelijk wordt voor een bredere gemeenschap van onderzoekers in de geesteswetenschappen en sociale wetenschappen.

Ontwikkeld aan het Donders Instituut voor Brein, Cognitie en Gedrag (Radboud Universiteit) in samenwerking met het Hasso Plattner Instituut, is SMASH gebouwd op FAIR-dataprincipes — zodat onderzoeksdata Vindbaar, Toegankelijk, Interoperabel en Herbruikbaar is. Het platform is vrij beschikbaar als open-source software, ter ondersteuning van transparante en reproduceerbare wetenschap.

---

## 3. Octrooien (Patents)

**Nee** — SMASH is published as open-source software under the MIT license. All results are intended for open scientific use. No results have been generated that are suitable for patent protection.

---

## 4. Wetenschappelijke impact (Scientific impact)

SMASH addresses a significant methodological gap in humanities and social sciences research: the lack of accessible, integrated tools for multimodal communication analysis. Its scientific contributions include:

### Innovation in integrated multimodal analysis

SMASH is, to our knowledge, the first open-source platform to integrate nine distinct analysis modalities — audio features, prosody (eGeMAPS), pauses/fillers, facial expressions (FACS-based), visual embeddings, gesture kinematics, topic modeling, semantic networks, and temporal sentiment — into a single researcher-facing platform. Prior tools typically address only one or two modalities, requiring researchers to manually synchronize outputs from multiple disconnected tools.

### FAIR-compliant research data infrastructure

The platform implements a rigorous FAIR data architecture using Dublin Core metadata standards, ISO 639-1 language codes, and per-record provenance tracking. Each analysis result is linked to the specific tool version and parameters that produced it, enabling full reproducibility. The self-contained SQLite database with researcher-facing export API supports data archiving in repositories such as DANS and Zenodo.

### Lowering barriers to multimodal research

By providing an interactive web interface with no programming requirements, SMASH enables researchers in humanities, linguistics, communication studies, and related fields to conduct multimodal analysis that previously required substantial technical expertise. The platform's three-module design (Preview, Analysis, Analytics) supports workflows from initial data exploration to detailed per-video investigation to cross-corpus comparison.

### Methodological contributions

- **Cross-modal temporal alignment**: The time-aligned export endpoint synchronizes audio, prosody, facial, and transcript features on a common timeline, enabling novel analyses of how communication modalities interact over time.
- **DINOv2-based visual fingerprinting**: Application of self-supervised vision transformer embeddings to speaker visual style analysis, enabling clustering of presentation styles by visual characteristics.
- **Integrated gesture kinematics**: Combination of EnvisionHGDetector with Dynamic Time Warping for quantitative gesture analysis, bridging gesture studies and computational movement analysis.

### Enabling future research

The modular architecture and export API are designed to support downstream research applications: training multimodal ML models on the extracted features, conducting cross-cultural communication studies across the multilingual corpus (English, Spanish, German, Arabic), and investigating relationships between verbal and non-verbal communication channels.

---

## 5. Maatschappelijke impact (Societal impact)

### Open-source knowledge infrastructure

SMASH is released under the MIT license and published on GitHub, making the full platform — including processing pipeline, database, API, and web interface — freely available to the global research community. This directly contributes to open science principles and reduces barriers for institutions with limited resources for commercial tool licenses.

### Accessibility for non-technical researchers

A central goal of SMASH is making multimodal communication analysis accessible to researchers without programming experience. The web-based interface with interactive visualizations (Plotly, D3.js, Sigma.js) enables scholars in humanities, education, clinical communication, and related fields to engage with computational analysis methods they would otherwise be unable to use.

### Applications beyond academia

The multimodal analysis capabilities developed in SMASH have potential applications in:

- **Education**: Analyzing teaching effectiveness through integrated verbal and non-verbal communication patterns; providing feedback on presentation skills.
- **Clinical communication**: Supporting research into communication disorders, therapeutic interactions, and patient-provider communication.
- **Cross-cultural understanding**: The multilingual corpus (English, Spanish, German, Arabic) and language-agnostic analysis pipeline support research into cultural differences in communication styles.
- **Media and journalism**: Automated analysis of public speaking, political communication, and media presentations.

### Reproducible and transparent research

The FAIR-compliant database with full provenance tracking ensures that analyses conducted with SMASH can be independently verified and reproduced. The export API provides standardized outputs suitable for inclusion in publications, data archives, and reproducibility packages, supporting the broader movement toward transparent science.

### Partnership and knowledge exchange

The collaboration between Radboud University (Donders Institute) and Hasso Plattner Institute combines domain expertise in cognitive science and communication research with technical expertise in computer science and machine learning, fostering interdisciplinary knowledge exchange.

---

## 6. Research Data Management

### Data management approach

SMASH implements a comprehensive data management strategy aligned with FAIR principles:

#### Findable

- All video records carry unique persistent identifiers (video name + source combination).
- Corpus-level Dublin Core metadata (dc:title, dc:creator, dc:subject, dc:description, dc:publisher, dc:date, dc:type, dc:format, dc:identifier, dc:source, dc:language, dc:rights) enables discovery.
- Indexed summary statistics on key features support efficient search and filtering.

#### Accessible

- The SQLite database is self-contained with no external server dependencies, ensuring long-term accessibility.
- The researcher-facing export API provides 8 endpoints supporting standard formats (CSV, JSON, NumPy), accessible via HTTP without specialized client software.
- Docker Compose deployment ensures the platform can be set up on any system with Docker installed.

#### Interoperable

- ISO 639-1 language codes for multilingual corpus identification.
- Standard feature names aligned with established frameworks: eGeMAPS for prosody, FACS Action Units for facial expressions, Dublin Core for metadata.
- JSON-LD-ready provenance structure supporting future linked data integration.
- Export formats (CSV, JSON, NumPy) compatible with standard analysis tools (R, Python, SPSS, Excel).

#### Reusable

- Per-record provenance tracking: every analysis result links to the tool name, tool version, processing parameters, and timestamps.
- Corpus-level license and per-video source attribution.
- Schema versioning (`schema_version`, `pipeline_version`) for tracking database evolution.
- Comprehensive test suite ensuring data integrity across updates.

### Data storage and archiving

- **During the project**: Research data is stored in a SQLite database within the project materials folder, with version-controlled code on GitHub.
- **After the project**: The self-contained SQLite database, along with documentation and export scripts, will be deposited in an appropriate data repository (e.g., DANS EASY, Zenodo) with a persistent identifier (DOI). The open-source codebase on GitHub ensures continued accessibility of the analysis tools.
- **Sensitive data**: The current corpus consists of publicly available TED Talks. For future extensions involving sensitive recordings, the modular architecture supports local-only processing without cloud dependencies.

### Software preservation

- Source code: GitHub repository with MIT license, tagged releases.
- Dependencies: Pinned in `requirements.txt` (Python) and `package.json` (Node.js); Docker images for reproducible environments.
- Documentation: README with setup instructions, API endpoint documentation, materials folder structure specification.

---

## 7. Publicaties en output (Publications and output)

### Software output

| Output | Type | Access | URL/DOI |
|--------|------|--------|---------|
| SMASH platform (source code) | Software | Open Access (MIT) | GitHub: github.com/ShaddAhmed14/smash |
| SMASH database schema | Dataset/Software | Open Access | Included in repository |
| Processing pipeline | Software | Open Access | Included in repository (`setup/`) |

### Planned publications

| Title (working) | Type | Status | Target |
|-----------------|------|--------|--------|
| SMASH: An Open-Source Platform for Multimodal Communication Analysis | Journal article | In preparation | [target journal TBD] |
| FAIR-Compliant Data Infrastructure for Multimodal Corpora | Conference paper | Planned | [target venue TBD] |

### Conference presentations / demonstrations

[To be filled in by PI — list any talks, posters, demos given]

### Other output

- GitHub Pages documentation site
- Docker-based reproducibility package
- Researcher-facing export API (8 endpoints)

> **Note**: All publications will comply with NWO Open Access requirements. All scientific publications resulting from this grant will be freely accessible via Open Access at the time of publication, in accordance with NWO policy (www.nwo.nl/open-access-publiceren).

---

## 8. Financiele informatie (Financial information — voortgangsverslag only)

[To be filled in by PI/project administrator]

### Key points to address:
- Personnel costs (developer, postdoc, PI time)
- Computing resources / infrastructure costs
- Travel (Radboud — HPI collaboration)
- Any budget changes > 10,000 euro
- Partner contributions:
  - **Hasso Plattner Institute**: In-kind contribution (developer time, computational resources, ML expertise)
  - **Radboud University / Donders Institute**: In-kind contribution (PI time, domain expertise, research infrastructure)

---

*This document was drafted based on the current state of the SMASH codebase and repository history. Sections marked [To be filled in by PI] require input from the project leadership. All technical claims can be verified against the source code and test suite.*
