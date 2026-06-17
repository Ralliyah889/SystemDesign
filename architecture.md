# System Architecture Diagram

Below is the visual system architecture topology map for TagSense AI. 

> [!TIP]
> To render this diagram visually in your editor, open the markdown preview (e.g. `Cmd+Shift+V` in VS Code or click the preview button).

```mermaid
flowchart TD
    %% Define styles for professional appearance
    classDef client fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff;
    classDef ingest fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#cbd5e1;
    classDef database fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#cbd5e1;
    classDef monitor fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#cbd5e1;
    classDef app fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#cbd5e1;

    subgraph Upload_Ingress ["1. Ingress Tier"]
        C1["1. Content Upload Layer"] -->|HTTPS / API Stream| I2["2. Content Ingestion Layer"]
        I2 -->|Publish Message| K3["3. Kafka Event Streaming"]
    end

    subgraph AI_Processing ["2. Distributed AI Processing Pipeline"]
        K3 -->|Ingest Stream| P4["4. Data Preprocessing"]
        P4 -->|Preprocessed Tokens| N5["5. NLP Processing"]
        N5 -->|Extracted Entities| M6["6. Machine Learning Classification"]
        M6 -->|Labels & Confidence| E7["7. Moderation Engine"]
    end

    subgraph Storage_Search ["3. Storage & Indexing"]
        E7 -->|Structured Records| D8[("8. Metadata Database")]
        E7 -->|Token Inverted Index| S9[("9. ElasticSearch Index")]
    end

    subgraph Telemetry_Feedback ["4. Observability Framework"]
        E7 -->|Pipeline Latency & Signals| A10["10. Analytics Engine"]
        A10 -->|Metric Aggregations| O11["11. Monitoring System"]
    end

    subgraph User_Console ["5. Operator Console"]
        D8 -->|DB Queries| DB12["12. Dashboard"]
        O11 -->|Telemetry Stream| DB12
    end

    class C1,DB12 client;
    class I2,K3 ingest;
    class P4,N5,M6,E7 app;
    class D8,S9 database;
    class A10,O11 monitor;
```
