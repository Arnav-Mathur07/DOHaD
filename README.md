# 🧬 DOHaD Exposure Intelligence Platform
### *A high-fidelity research metadata curation, analytics, and intelligence platform mapping early-life environmental toxicant exposures to chronic disease susceptibility.*

---

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg?style=flat-square&logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.x-lightgrey.svg?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-orange.svg?style=flat-square&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![Leaflet.js](https://img.shields.io/badge/Leaflet-1.9-green.svg?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![PubMed](https://img.shields.io/badge/Database-PubMed-red.svg?style=flat-square)](https://pubmed.ncbi.nlm.nih.gl/)
[![Research](https://img.shields.io/badge/Field-DOHaD%20%7C%20Toxicology-purple.svg?style=flat-square)](https://www.dohadsoc.org/)
[![Open Source](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

# 📖 Overview

The **Developmental Origins of Health and Disease (DOHaD)** paradigm demonstrates that environmental exposures during critical windows of early life—prenatal development and early postnatal stages—permanently shape physiological structure and function, determining susceptibility to chronic non-communicable diseases later in life. 

Among these environmental hazards, heavy metals (such as **Arsenic**, **Cadmium**, **Lead**, and **Mercury**) are highly toxic, persistent, and ubiquitous. Because these toxicants easily cross the maternal-fetal barrier, early-life exposure can disrupt normal epigenetic programming, metabolic homeostasis, and organogenesis.

Despite the critical importance of DOHaD research, the scientific literature remains highly fragmented. Thousands of toxicology studies are scattered across disparate academic journals, written in varying formats, and indexed under generic medical terms. Consequently, epidemiologists, toxicologists, and policymakers struggle to quickly identify trends, isolate exposure thresholds, or run meta-analyses on how specific toxicants impact target organ systems.

The **DOHaD Exposure Intelligence Platform** addresses this fragmentation by providing a unified repository and analysis suite. The platform offers a structured, quality-controlled research database, multi-dimensional filtering, and interactive visualizations. It bridges the gap between raw scientific papers and actionable epidemiological insights.

---

# ✨ Key Features

| Feature Group | Description | Included Capabilities |
| :--- | :--- | :--- |
| **🔍 Search & Filter** | Precise, multi-level criteria matching | • Automated PubMed metadata extraction<br>• AND-logic filtering across five metadata fields<br>• Dynamic keyword search inside titles and abstracts |
| **📊 Visual Analytics** | Interactive graphs for data trends | • Temporal publication trends via Line Charts<br>• Toxicant distribution analysis<br>• Organ-wise toxicity tracking<br>• Dose-response distribution mapping |
| **🗺️ Geographic Mapping** | Real-time geospatial distribution | • Dynamic Leaflet-based interactive maps<br>• Regional study mapping per toxicant |
| **⚡ Architecture** | Lightweight and performant design | • Client-side static memory querying via CSV<br>• Relational SQL option for larger scale storage<br>• Persisted filter states using session memory |

---

# 🏗️ System Architecture

The DOHaD Exposure Intelligence Platform is designed with a decoupled architecture. This allows for both lightweight static deployments (loading preprocessed datasets client-side via JavaScript) and database-backed enterprise environments (powered by Node.js, Express, and MySQL).

```mermaid
graph TD
    %% Define styles
    classDef frontend fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef backend fill:#efebe9,stroke:#5d4037,stroke-width:2px;
    classDef storage fill:#efe8e0,stroke:#e65100,stroke-width:2px;
    classDef ingestion fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    %% Data Ingestion Pipeline
    subgraph Curation [Data Collection & Processing]
        A[Academic Literature / PubMed] -->|Entrez API| B[Python Extractor & QC Scripts]
        B -->|Standardization & Label Injection| C[dohad_platform/frontend/assets/prenatal_heavy_metals.csv]
        B -->|Database Seeding| D[DOHaD.sql / MySQL 8.0]
    end
    class B,C ingestion;
    class D storage;

    %% Server & Storage Layer
    subgraph ServerLayer [Production Backend / Optional]
        E[Node.js Express API] -->|mysql2 connector| D
        E -->|JSON Endpoints| F[API Controller]
    end
    class E,F backend;

    %% Client Layer
    subgraph ClientLayer [Interactive Frontend Application]
        G[Browser UI / HTML5 & CSS3]
        H[script.js Core Application Engine]
        I[Dynamic Query / Filter Logic]
        J[Chart.js / Data Visualization]
        K[Leaflet.js / Interactive Map Cell Grid]

        G -->|User Input Event| H
        H -->|Fetches Static CSV / API| C
        H -->|appState Caching & Persistence| I
        I -->|Calculates Data Arrays| J
        I -->|Calculates Coordinates| K
    end
    class G,H,I,J,K frontend;

    %% Interconnection
    F -->|Optional REST Data| H
```

---

# 📂 Project Structure

The project repository is structured to separate production source files, database schemas, and scripting utilities:

```directory
dohad_platform/
├── backend/                  # Production API (Node.js/Express)
│   ├── package.json
│   ├── package-lock.json
│   └── server.js             # API entry point & user login authentication routes
├── database/                 # MySQL database files
│   └── DOHaD.sql             # SQL DB installation schemas and seed datasets
├── frontend/                 # Client-side web application source files
│   ├── css/
│   │   ├── auth.css
│   │   └── style.css         # Main platform design system
│   ├── js/
│   │   └── script.js         # Core application logic, charts, and filter engine
│   ├── assets/               # Unified operational datasets and graphic elements
│   │   ├── prenatal_heavy_metals.csv
│   │   ├── landscape_infographic.png
│   │   └── vision_clean.png
│   ├── index.html            # Main platform homepage & news feed
│   ├── database.html         # Advanced research search database
│   ├── analytics.html        # Interactive data analytics suite
│   ├── auth.html             # User login and account signup portal
│   ├── news.html             # Live medical/health headline feeds
│   ├── team.html             # Research group page
│   └── about.html            # Documentation of project dataset demographics
└── scripts/                  # Curation, parsing, and data cleaning utilities
    ├── build_hybrid.py       # Rebuilds index.html and standalone pages
    ├── create_dohad_db.py    # Python script loading CSV data to local MySQL
    ├── create_dohad_sql.py   # Code generator parsing CSV and writing SQL scripts
    ├── fix_navs.py           # Navbar sync utility
    ├── fix_nav_order.py      # Navbar order and active link formatter
    ├── inject_labels.py      # Cleans CSV strings and maps affected organs
    └── inject_refresh.py     # Updates CSV indices with updated source files
```

---

# ⚙️ Technology Stack

| Architecture Layer | Technology | Library / Package | Implementation Detail |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | HTML5 / CSS3 / ES6+ JavaScript | Vanilla JS / Google Fonts | Semantic markup, responsive flexbox layout, custom typography |
| **Interactive UX** | GSAP (GreenSock) | `gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js` | Smooth scrolling, scroll-triggered fade animations, magnetic cursor feedback |
| **Visual Analytics** | Chart.js / Leaflet | `chart.js`, `leaflet.js` | Live charts rendering, custom interactive pie-chart events, geospatially plotted data |
| **Backend API** | Node.js / Express | `express`, `cors`, `bcrypt` | REST endpoints for data extraction, secure sign-up/login password hashing |
| **Database** | MySQL 8.0 | `mysql2` | Relational database engine, schemas with multi-table database queries |
| **Data Pipelines** | Python 3 | `re`, `shutil`, `glob`, `mysql.connector` | Scripting for cleaning CSV metadata, automated updates, and mapping organs |

---

# 🔬 Scientific Background

```mermaid
flowchart TD
    %% Publication-Quality Color Palette (Theme-Adaptive)
    classDef blueBox stroke:#3b82f6,stroke-width:2px,rx:12px,ry:12px;
    classDef purpleBox stroke:#a855f7,stroke-width:2px,rx:12px,ry:12px;
    classDef orangeBox stroke:#f97316,stroke-width:2px,rx:12px,ry:12px;
    classDef greenBox stroke:#22c55e,stroke-width:2px,rx:12px,ry:12px;
    classDef redBox stroke:#ef4444,stroke-width:2px,rx:12px,ry:12px;
    classDef diseaseList stroke:#ef4444,stroke-width:1px,stroke-dasharray: 3 3,rx:8px,ry:8px;

    %% Nodes
    A["🧪 Early-Life Environmental Toxicants<br/>(Lead, Mercury, Cadmium, Arsenic)"]:::blueBox
    B["🤰 Placental Transfer & Fetal Exposure"]:::blueBox
    C["🧬 Disrupted Epigenetic Programming<br/>(DNA Methylation / Histone Modifications)"]:::purpleBox
    
    D["🫀 Altered Organogenesis"]:::orangeBox
    E["⚖️ Endocrine Disruption"]:::orangeBox
    
    F["⚙️ Permanent Alterations in Physiology"]:::greenBox
    
    G["⚠️ Increased Chronic Disease Risk"]:::redBox
    
    H["🩺 Neurodevelopmental Disorders<br/>🩺 Cardiovascular Diseases<br/>🩺 Renal Disorders<br/>🩺 Respiratory Disorders"]:::diseaseList

    %% Structural Alignment & Layout
    A --> B
    B --> C
    
    %% Balanced Branching
    C --> D
    C --> E
    
    %% Seamless Merging
    D --> F
    E --> F
    
    F --> G
    G --- H

    %% Thin, Smooth Scientific Arrows
    linkStyle 0,1,2,3,4,5,6 stroke:#94a3b8,stroke-width:1.5px,fill:none;
    linkStyle 7 stroke:none;
```

The **Developmental Origins of Health and Disease (DOHaD)** paradigm illustrates how early-life environmental exposures interact with human development to permanently shape biological trajectories. During critical windows of fetal gestation, toxicant exposures—such as heavy metals (Lead, Mercury, Cadmium, Arsenic)—are not merely acute hazards but potent modifiers of long-term physiological programming.

When a mother is exposed to these environmental toxicants, the compounds often bypass the placental barrier, leading to direct fetal exposure. Because developing organ systems are highly plastic, these stressors induce profound molecular responses. Specifically, rather than directly mutating DNA sequences, toxicants disrupt **epigenetic programming** through anomalous DNA methylation, histone modification, and non-coding RNA interference.

These epigenetic shifts misregulate cellular differentiation and disrupt developmental homeostasis. As a result, processes like organogenesis are structurally altered, and endocrine signaling pathways are disrupted. These changes become embedded as permanent physiological deviations, a process known as **developmental programming**. 

Ultimately, these hardwired deviations manifest as an increased susceptibility to chronic, non-communicable diseases later in life. Individuals exposed in utero face significantly higher lifetime risks for a spectrum of pathologies, including neurodevelopmental disorders, cardiovascular disease, renal dysfunction, and chronic liver or respiratory conditions. Understanding this pathway is critical for developing early interventions and establishing tighter environmental regulations.

The scientific basis of this project rests on several key areas of developmental toxicology and environmental health:

### 1. The DOHaD Hypothesis
Organisms are highly sensitive to their environment during early development. Environmental stressors (such as nutrition or toxicants) can trigger permanent changes in physiology and structure through **fetal programming**. These shifts, while sometimes serving as immediate adaptations to survive in-utero stress, often lead to a mismatch with the postnatal environment, increasing the risk of chronic diseases in adulthood.

### 2. Epigenetic Modifications
Heavy metals do not necessarily alter DNA sequences directly. Instead, they interfere with epigenetic mechanisms. Prenatal metal exposure can alter **DNA methylation patterns**, modify **histones**, and disrupt **non-coding RNA expression**. These changes can silenece or overexpress genes regulating cellular differentiation, leaving a molecular footprint that persists throughout the individual's life.

### 3. Fetal Organogenesis & Tissue-Specific Vulnerability
During gestation, organs develop at different rates. Exposure to developmental toxicants during these precise windows can disrupt tissue development:
*   **Neurodevelopment:** Metals like Lead and Mercury easily cross the blood-brain barrier, altering synaptic connectivity and neural stem cell differentiation.
*   **Cardiovascular System:** Arsenic exposure impairs endothelial function and microvascular development, laying the groundwork for adult hypertension and cardiovascular disease.
*   **Renal Development:** Cadmium accumulates in the developing renal cortex, reducing nephron endowment and predisposing individuals to chronic kidney disease (CKD).

---

# 📚 Literature Collection Pipeline & Data Workflow

```mermaid
flowchart TD
    %% 1. Ingestion Pipeline Steps
    Step1[1. PubMed Database Query] -->|Entrez API Search| Step2[2. XML Metadata Extraction]
    Step2 -->|Extract Title, Abstract, DOI| Step3[3. Automated Preprocessing & Cleaning]
    Step3 -->|Regex Labeling & Deduplication| Step4{4. Data Export}
    
    Step4 -->|Static Ingestion| Step4a[4a. CSV Generation]
    Step4 -->|MySQL Seeding| Step4b[4b. SQL Generation]
    
    %% 2. Application Workflow Steps
    Step4a --> Step5[5. Client-side Fetch & In-Memory Parsing]
    Step5 --> Step6[6. In-Memory State Management]
    
    %% 3. User Action Loop
    Step6 --> UserAction{7. User Updates Filters}
    UserAction -->|Filter change / Search input| Step7[8. Multi-Gate AND Filtering]
    Step7 --> Step8[9. Update Chart.js & Leaflet UI]
    Step8 --> Step9[10. Render Paginated Research Cards]
    Step9 -->|Updates Cached State| Step6
```

The dataset is maintained and queried using an automated pipeline designed to retrieve, parse, and structure academic literature before feeding it into the interactive frontend:

1.  **Entrez API Querying:** Python scripts query the NCBI Entrez Utilities to pull relevant literature. The search query targets research containing key terms: `(prenatal OR developmental OR in utero) AND (heavy metals OR arsenic OR lead OR mercury OR cadmium) AND (toxicity OR outcomes)`.
2.  **XML Parsing:** The Entrez server returns raw XML files.  Metadata fields are extracted using Python‘s XML parsing libraries such as the PubMed ID (PMID), Title, Abstract, Journal, Year of Publication, and DOI.
3. **Data Enrichment:** Regex pattern matching, scripts analyze the titles and abstracts to began pre classifying:
    *   *Species:* Categorized as `Human` or `Animal` based on keyword lists (e.g., *murine, rat, mouse, pregnancy, cohort*).
    *   *Exposure Window:* Flagged as `Prenatal` or `Developmental`.
    *   *Organ System:* Mapped to specific organ categories (e.g., *brain, kidney, liver, heart, lung*) if relevant vocabulary is detected in the text.
4.  **Export:** The pipeline produces both a common CSV file (prenatal_heavy_metals.csv),  and a formatted SQL script (DOHaD.sql) with pre-formatted INSERT statements ready to be imported into a database.
5. **Interactive workflow.** When the data gets exported out, it is loaded in to memory on the client side.  Now a user can interact with the UI, the engine filters the data very fast and re-render the chart and study cards dynamically.

---

# 📊 Metadata Captured

The platform processes and displays the following metadata schema:

| Field Name | Data Type | Database Column | Frontend Property | Description / Extraction Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **PubMed ID** | `VARCHAR(20)` | `pmid` | `item.pmid` | The unique identifier assigned by NCBI's PubMed database. |
| **Title** | `TEXT` | `title` | `item.title` | Full title of the peer-reviewed research publication. |
| **Abstract** | `LONGTEXT` | `abstract` | `item.abstract` | Complete article abstract (used for deep keyword searching). |
| **Journal** | `VARCHAR(255)` | `journal` | `item.journal` | Publishing scientific journal. |
| **Year** | `INT` | `year` | `item.year` / `_numericYear` | Year of publication (used for time-series trend analysis). |
| **Toxicant** | `VARCHAR(50)` | `toxicant` / `metal` | `item.metal` | The heavy metal studied: `Arsenic`, `Cadmium`, `Lead`, or `Mercury`. |
| **Dose** | `VARCHAR(100)`| `dose` | `item.dose` | The experimental or environmental dose levels reported. |
| **Exposure Window**| `VARCHAR(100)`| `exposure_window`| `item.exposure_window` | The target developmental stage (e.g., `Prenatal`, `Developmental`). |
| **Species** | `VARCHAR(50)` | `species` | `item.species` | The model organism class: `Human` or `Animal`. |
| **Country** | `VARCHAR(100)`| `country` | `item.country` | Country where the research cohort or experimental study was located. |
| **Target Organ** | `TEXT` | `organ` | `item.organ` | Organ systems analyzed (e.g., `Brain`, `Kidney`, `Liver`, `Heart`, `Lungs`). |
| **Outcome** | `TEXT` | `key_finding` / `outcome` | `item.outcome` | Key toxicological finding or biological outcome observed. |
| **DOI** | `VARCHAR(255)`| `doi` | `item.doi` | Digital Object Identifier linking directly to the publisher's site. |
| **Article Type** | `VARCHAR(50)` | `article_type` | `item.article_type` | Categorization of the paper structure: `Research` or `Review`. |

---

# 🧹 Quality Control

To ensure the integrity of the data used for visualizations and search tools, the preprocessing pipeline applies several validation steps:

*   **BOM Correction:** Removes the UTF-8 Byte Order Mark (`\uFEFF`) from raw files, which can otherwise corrupt CSV headers in memory.
*   **Strict Column Alignment:** Standardizes column names across files (e.g., aliasing `dose (ppm)` to `dose` and `organs` to `organ`).
*   **Type Coercion:** Casts publication years to numeric integers (`_numericYear`) to ensure numerical filtering works correctly.
*   **Duplicate Filtering:** Uses the unique PubMed ID (`pmid`) as a primary key to deduplicate records during updates.
*   **String Sanitization:** Trims whitespace and strips unescaped double quotes that could break standard CSV line readers.

---

# 💾 Data Storage

The platform supports two storage methods, balancing simplicity with scalability:

### 1. Flat-File Storage (Static Deployment)
*   **Format:** Structured CSV file (`prenatal_heavy_metals.csv`) stored in `frontend/assets/`.
*   **In-Memory Querying:** Loaded client-side via a fetch request. A custom, quote-aware parsing engine processes the CSV in the browser.
*   **Advantage:** Allows the platform to run serverless, making it easy to deploy on static hosts like GitHub Pages.

### 2. Relational Database (Enterprise Deployment)
*   **Format:** Relational MySQL schema (`DOHaD` and `dohad_auth` databases).
*   **Server Stack:** Node.js Express server running on port `3000` using the `mysql2` driver.
*   **Database Tables:**
    *   `arsenic_prenatal`: Stores detailed data for prenatal arsenic exposure.
    *   `cadmium`: Stores cadmium toxicology metrics.
    *   `all_papers` (VIEW): Dynamically joins (`UNION ALL`) toxicant tables, creating a unified view for broad database queries.
    *   `dohad_auth.login details`: Stores user credentials with passwords hashed using `bcrypt` (10 salt rounds).

```sql
-- Conceptual DOHaD VIEW Schema
CREATE VIEW all_papers AS
SELECT pmid, title, abstract, journal, year, 'Arsenic' AS metal, dose, exposure_window, key_finding AS outcome, country, organ, source_file FROM arsenic_prenatal
UNION ALL
SELECT pmid, title, abstract, journal, year, 'Cadmium' AS metal, dose, exposure_window, key_finding AS outcome, NULL AS country, organs_detected AS organ, source_file FROM cadmium;
```

---

# 🔎 Filtering Engine

The search and filtering logic operates client-side to provide responsive results as users type or change criteria:

```
                  ┌───────────────────────────────┐
                  │ Global In-Memory Dataset      │
                  │ (appState.data Array)         │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                     [applyFilters() Execution]
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Search Keyword  │      │ Dropdown Select │      │ Numeric Range   │
│ Match: Title /  │  AND │ Matches: Metal, │  AND │ Validation:     │
│ Abstract /      │      │ Species,        │      │ Year Range      │
│ Outcome String  │      │ Country, Stage  │      │                 │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                  ┌───────────────────────────────┐
                  │ Target Result Set             │
                  │ (appState.filteredData)       │
                  └───────────────────────────────┘
```

*   **AND-Gate Logic:** The application applies all active filters simultaneously. A record is only included in the output if it meets every selected criteria.
*   **Deep Keyword Search:** The search input compares terms against the title, key findings, and abstract text, returning matches regardless of letter case.
*   **Exposure Period Extraction:** If a user filters by exposure window, the engine runs text matches on the title and key findings to identify relevant studies.
*   **Article Type Detection:** Filters partition the dataset into `Research` or `Review` by analyzing metadata tags and checking titles for keywords (e.g., searching for "review").
*   **State Persistence:** Active filter criteria are serialized and saved to the browser's `sessionStorage`. This maintains the user's focus state when navigating between pages (e.g., index, database, analytics).

---

# 📈 Analytics Dashboard

The **Analytics Dashboard** (`analytics.html`) renders interactive charts using the filtered dataset to visualize trends:

### 1. Studies per Year (Line Chart)
*   **X-Axis:** Years of Publication | **Y-Axis:** Total Volume of Studies
*   **Scientific Value:** Tracks the history of DOHaD research, showing how interest in developmental toxicology has grown over time.

### 2. Heavy Metal Distribution (Pie Chart with Interactive Overlay)
*   **Structure:** Segmented by toxicant types (Arsenic, Cadmium, Lead, Mercury).
*   **Interactive Mappings:** Clicking a slice filters the dataset by that metal and opens a custom pop-up showing organ involvement (Heart, Lungs, Liver, Kidney, Brain) for that toxicant.
*   **Scientific Value:** Quickly highlights which toxicants have been studied most, and which organ systems are most frequently associated with their toxicity.

```
       [ Pie Chart Slice Click Event ]
                      │
                      ▼
        Extract Selected Metal Name
                      │
                      ▼
   Scan appState.filteredData for Matches
                      │
                      ▼
     Parse "organ" column text per row
                      │
                      ▼
     Increment organ system counters
  (counts.heart, counts.lungs, counts.brain...)
                      │
                      ▼
  Inject results into body-parts-overlay Table
```

### 3. Dose Distribution (Faceted Grid)
*   **Structure:** Four separate bar charts, one for each metal, showing exposure doses.
*   **Scientific Value:** Helps researchers compare exposure ranges across studies and identify common dose thresholds.

### 4. Geographic Distribution (Leaflet Map Cells)
*   **Structure:** A grid of interactive mini-maps.
*   **Scientific Value:** Shows where research cohorts and studies are located globally, highlighting geographic areas that may need more study.

---

# 🎨 User Interface & Experience

The platform is designed to look clean, professional, and modern, using vanilla frontend technologies:

*   **Responsive Layout:** Uses CSS Grid and Flexbox to adapt the interface across mobile devices, tablets, and wide desktop screens.
*   **Sleek Styling:** A modern, clinical color palette built around custom CSS variables (deep slate, cool blues, and vibrant highlight accents).
*   **GSAP Animations:** Animates cards as they load into the results grid, providing smooth transitions without impacting performance.
*   **ScrollTrigger:** Fades and slides page sections into view as the user scrolls, creating a polished, cohesive presentation.
*   **Lenis Smooth Scroll:** Standardizes scrolling behavior across different browsers and devices for a consistent user experience.

---

# 🚀 Future Scope

*   **Vector Embeddings & Semantic Search:** Plan to integrate a lightweight vector search library (like `transformers.js`) to allow users to search by conceptual meaning rather than exact keywords (e.g., linking "neurodevelopmental deficits" with "cognitive delay").
*   **Automated Literature Updates:** Planning to schedule backend cron jobs that run the Python Entrez parser weekly, ensuring the database stays up to date automatically.
*   **Extended Metal Profiles:** Expand the database schema to include other developmental toxicants, such as Chromium, Nickel, and organic pollutants.

---

# 🤝 Contribution Guidelines

We welcome contributions from researchers, toxicologists, and software developers. 

1.  **Fork the Repository:** Create a personal copy of the project on GitHub.
2.  **Create a Feature Branch:** `git checkout -b feature/your-feature-name`.
3.  **Adhere to Standards:** Ensure code updates follow the existing structure and do not introduce errors.
4.  **Open a Pull Request:** Provide a clear description of the changes and the problem they solve.

For scientific corrections (such as updating metadata classifications), please open an issue with the relevant PubMed ID (PMID) and citation.

---

# 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

# 🙏 Acknowledgements

*   **NCBI PubMed / Entrez Utilities:** For providing the API infrastructure that powers our literature collection.
*   **The DOHaD Society:** For establishing the scientific framework and research foundations that inspired this platform.
*   **The Open-Source Community:** For providing the libraries (Chart.js, Leaflet, GSAP) that power our visualizations and interface.

---

# 📬 Contact

*   **Project Lead:** Academic Research Group
*   **Email:** [info@dohadplatform.org](mailto:info@dohadplatform.org)
*   **Institution:** DOHaD Exposure Intelligence Research Initiative
