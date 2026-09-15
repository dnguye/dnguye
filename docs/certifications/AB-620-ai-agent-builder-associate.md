# Exam AB-620 Study Guide: Designing and Building Integrated AI Agent Solutions in Copilot Studio

**Certification earned:** Microsoft Certified: AI Agent Builder Associate
**Guide compiled:** September 15, 2026
**Source of truth:** Microsoft's official AB-620 study guide (skills measured as of April 9, 2026; page last updated July 31, 2026), the certification page (updated August 5, 2026), and the current Microsoft Learn product documentation for Copilot Studio, Power Platform, Microsoft Foundry, and Microsoft Fabric. Community exam reports are used only for things Microsoft does not publish (question count, candidate experience, topic emphasis) and are labeled as such.

> **Currency warning.** Microsoft updates skills outlines and product features continuously. Before your exam date, re-read the official study guide at <https://aka.ms/AB620-StudyGuide> and check its change log. Anything in this guide that conflicts with the official study guide on your exam date is out of date.

---

## Table of contents

1. [Exam at a glance](#1-exam-at-a-glance)
2. [Who this exam is for](#2-who-this-exam-is-for)
3. [Exam structure, question types, and rules](#3-exam-structure-question-types-and-rules)
4. [Official skills measured (verbatim outline)](#4-official-skills-measured)
5. [Domain 1 deep dive: Plan and configure agent solutions (30–35%)](#5-domain-1-plan-and-configure-agent-solutions-3035)
6. [Domain 2 deep dive: Integrate and extend agents in Copilot Studio (40–45%)](#6-domain-2-integrate-and-extend-agents-in-copilot-studio-4045)
7. [Domain 3 deep dive: Test and manage agents (20–25%)](#7-domain-3-test-and-manage-agents-2025)
8. [Cross-cutting facts you must know cold](#8-cross-cutting-facts-you-must-know-cold)
9. [Sample questions with answers and explanations](#9-sample-questions)
10. [Hands-on lab checklist](#10-hands-on-lab-checklist)
11. [Four-week study plan](#11-four-week-study-plan)
12. [Official and community resources](#12-official-and-community-resources)
13. [Exam-day strategy](#13-exam-day-strategy)
14. [Glossary](#14-glossary)
15. [Sources](#15-sources)

---

## 1. Exam at a glance

| Item | Detail | Source |
| --- | --- | --- |
| Exam code and title | AB-620: Designing and Building Integrated AI Agent Solutions in Copilot Studio | Microsoft study guide |
| Certification | Microsoft Certified: AI Agent Builder Associate | Microsoft certification page |
| Level | Intermediate (associate, role-based) | Microsoft certification page |
| Products tagged | Azure, Microsoft 365 Copilot, Microsoft Copilot Studio, Microsoft Power Platform | Microsoft certification page |
| Roles tagged | App Maker, Developer | Microsoft certification page |
| Exam duration | 120 minutes to answer. Microsoft's duration table puts associate exams "that may contain labs" at 120 minutes with 140 minutes seat time. | Microsoft cert page; exam duration page |
| Number of questions | Not published. Microsoft says most exams contain 40–60 questions. Community reports for AB-620 fall in that range. | Microsoft exam duration page; community |
| Passing score | 700 on a scale of 1–1000 (scaled, not a percentage) | Microsoft study guide |
| Price | About USD 165 in the United States; Microsoft prices by country or region | Microsoft cert page; community |
| Delivery | Pearson VUE, online proctored or test center | Microsoft cert page |
| Languages | English, Arabic (Saudi Arabia), Chinese (Simplified), Chinese (Traditional), French, German, Indonesian (Indonesia), Italian, Japanese, Korean, Portuguese (Brazil), Russian, Spanish | Microsoft cert page |
| Microsoft Learn access during exam | Yes (role-based exams only). Timer keeps running. Q&A, Practice Assessments, and profile are blocked. | Microsoft exam duration page |
| Practice Assessment | "Not currently available" as of the certification page's August 5, 2026 update. Microsoft says Practice Assessments usually appear within 8 weeks of an exam leaving beta. Check the cert page. | Microsoft cert page |
| Exam sandbox | <https://aka.ms/examdemo> (same UI, question types, and candidate agreement as the real exam) | Microsoft study guide |
| Retake policy | Retake allowed 24 hours after the first failed attempt; longer waits for later attempts | Microsoft cert page |
| Renewal | Associate certifications expire annually. Renew free with an online assessment on Microsoft Learn. | Microsoft study guide |
| Timeline | Announced in beta April 21, 2026 (80% discount for first 300 takers through May 12, 2026). Microsoft targeted general availability in June 2026. Beta rescoring begins when the exam goes live, with results about 10 days later. | Microsoft Tech Community (Skills Hub blog) |
| Register with | A personal Microsoft account (MSA). Microsoft warns that records tied to an organizational account are lost if you leave the organization. | Microsoft cert page |
| Accommodations | Extra time and assistive-device accommodations available on request; 30 extra minutes if the exam is not offered in your preferred language | Microsoft study guide |
| Official course | AB-620T00-A: Design and build integrated AI agent solutions in Copilot Studio (3 days instructor-led; the same three learning paths are free and self-paced) | Microsoft Learn course page |

---

## 2. Who this exam is for

Microsoft's audience profile, paraphrased from the official study guide:

- You are a **professional developer or advanced builder** who builds, extends, and integrates custom agents for enterprise-grade solutions. Typical job titles: IT application developer, consultant, ISV partner.
- You are **already familiar with** Power Fx, Microsoft Dataverse, Power Platform environments and components, Microsoft 365 Copilot, Microsoft Foundry, and Adaptive Cards.
- You have **intermediate knowledge of generative AI concepts**: models, orchestration, retrieval-augmented generation (RAG), Model Context Protocol (MCP), Agent2Agent (A2A) protocol.
- You have **experience with prompt engineering, REST APIs, and integration patterns**, and you have already configured agents with basic knowledge sources, instructions, tools, and topics in Copilot Studio.

What you do on the job (the study guide's own list):

- Integrate agents with Microsoft Foundry, MCP servers, custom connectors, APIs, Microsoft Fabric, and connectors; automate tasks with computer use.
- Create multi-agent solutions, agents with enterprise knowledge sources (ServiceNow, SAP, and similar), advanced topics and tools, computer-using agents, and agents that perform advanced actions through APIs.
- Collaborate with Microsoft 365 admins, Power Platform admins, Copilot admins, agent builders, Copilot Studio admins, Foundry admins, agentic AI business solution architects, and Copilot Studio architects.

### Where AB-620 sits in the AB series

| Exam | Credential | Audience |
| --- | --- | --- |
| AB-900 | Copilot and agent administration fundamentals | Admins, fundamentals level |
| AB-730 / AB-731 | AI business professional exams | Non-technical Microsoft 365 Copilot users |
| **AB-620** | **AI Agent Builder Associate** | **Developers and advanced makers building in Copilot Studio** |
| AB-100 | Agentic AI Business Solutions Architect | Architects; community sources report it requires an existing associate certification to be awarded |

Community reviewers note a mismatch between the "App Maker" role tag and the actual difficulty: AB-620 is a developer-level integration exam, not a maker fundamentals exam. Vlad Catrinescu, who took the beta, observed that Microsoft originally planned two exams (AB-610 and AB-620) and consolidated them into one developer-focused credential.

### No formal prerequisite

No exam is required before AB-620. In practice, most candidates benefit from PL-900-level Power Platform knowledge and hands-on Copilot Studio experience. Forward Forever's review specifically calls out that the official learning content is thin on Power Platform ALM basics (managed versus unmanaged solutions, solution layers, pipelines, environment types, environment variables including secrets, cloud-flow error handling), so candidates without a Power Platform background should study those separately.

---

## 3. Exam structure, question types, and rules

Microsoft does not publish the exact format of any exam, but its exam sandbox and support pages document the question types that role-based exams use. Expect a mix of:

| Question type | What it looks like | How to handle it |
| --- | --- | --- |
| Multiple choice | One correct answer among four or five | Eliminate options that violate a documented limitation |
| Multiple response | "Select two" or "Each correct answer presents part of the solution" | Count the required answers; partial credit is not guaranteed |
| Yes/No problem-solution series | The same scenario appears in consecutive questions, each proposing a different solution; you answer "Does the solution meet the goal?" | You cannot go back within the series. Judge each solution on its own. More than one can be "Yes" and all can be "No". |
| Drag and drop / build list | Order steps or match items to categories | Common for procedures such as adding a REST API tool, building a pipeline, or exporting a solution |
| Hot area / active screen | Click a region of a screenshot or configure a dialog | Know where settings live (for example Settings > Advanced for Application Insights; Settings > Security > Authentication) |
| Case study | A multi-page scenario (background, requirements, existing environment) followed by several questions | Read the requirements tabs first, then answer; you can revisit questions within the case study but not after you leave it |
| Labs (possible) | Hands-on tasks in a live environment | Microsoft lists AB-620 in the 120-minute bracket, which is the "may contain labs" bracket. Labs can be removed at any time. Read the overview screens at exam start to see whether labs are included. |

Community exam reports (Vlad Catrinescu, Forward Forever, July 2026) describe the delivered exam as scenario heavy, with ordered-list questions and multi-step problems, and note that "do every scenario in the exam objectives at least once" is the best preparation for the ordered-list items.

### Rules that trip people up

- **Breaks.** You may take unscheduled breaks, but the clock keeps running, and you cannot return to any question you saw before the break, even ones marked for review. Breaks are not allowed inside a lab or inside a yes/no problem-solution set.
- **Microsoft Learn in the exam.** A split-screen Learn browser is available for role-based exams. It is restricted to the learn.microsoft.com domain, no extra time is added, and Ctrl+F works inside a Learn page. Use it for a fact you almost remember (a limit, a connector name, a scope), not to research every question.
- **Scoring.** 700 is a scaled score, not 70%. Unanswered questions score zero, so answer everything.
- **Preview features.** The study guide states that most questions cover GA features but the exam may include commonly used preview features. Several AB-620 topics are still preview as of September 2026 (Foundry agent connection, Fabric data agent connection, REST API tools, real-time Power Platform knowledge connectors, Dataverse MCP server, hosted browser and Cloud PC pool for computer use). Study them anyway.
- **Standard harness.** The Copilot Studio documentation now distinguishes the **standard harness** (rule-based agents, topics, agent flows), the **GitHub Copilot harness** (reasoning-heavy agents with skills, memory, and file handling), and the **Copilot chat harness** (extending Microsoft 365 Copilot Chat). Every feature in the AB-620 outline (topics, agent flows, generative answers nodes, MCP, computer use, connected agents, evaluations) is documented under the standard harness, and the official learning modules state they are based on the classic experience. If a question mentions skills or memory, that is GitHub Copilot harness territory and is not in the AB-620 outline.

---

## 4. Official skills measured

This section reproduces the official outline. Every bullet below is a testable skill; Microsoft states that "related topics may be covered."

### Skills at a glance

- Plan and configure agent solutions (30–35%)
- Integrate and extend agents in Copilot Studio (40–45%)
- Test and manage agents (20–25%)

### Plan and configure agent solutions (30–35%)

**Plan an agent solution**
- Plan integration with enterprise systems
- Plan identity strategy
- Plan channels and deployment
- Plan responsible AI strategy
- Evaluate security and governance considerations
- Plan reusable agent components
- Design agents for internal or external audiences

**Create and monitor agent flows in Copilot Studio**
- Create an agent flow
- Create a human-in-the-loop agent flow
- Configure actions and connectors
- Monitor agent flows
- Add input and output parameters
- Implement error handling in agent flows

**Configure topics**
- Add agent flows to a topic
- Configure agent response formatting
- Add tools to a topic
- Configure advanced agent responses with custom prompts
- Configure advanced agent responses with custom knowledge sources
- Configure advanced agent responses with API and Send HTTP requests
- Configure generative answers node
- Configure adaptive cards
- Manage variables

### Integrate and extend agents in Copilot Studio (40–45%)

**Connect to enterprise knowledge sources**
- Connect to Copilot connectors
- Connect to Microsoft Power Platform connectors
- Connect to Azure AI Search

**Add tools to agents**
- Configure and monitor computer use for an agent
- Configure MCP tools
- Add a tool by using an existing custom connector
- Add REST APIs to an agent

**Configure multi-agent collaboration from Copilot Studio**
- Design multi-agent solutions in Copilot Studio
- Integrate a Foundry agent
- Integrate an existing agent in Copilot Studio
- Integrate a Fabric data agent
- Create a multi-agent solution by using A2A protocol

**Integrate agents with Azure**
- Configure generative answers by using Azure AI Search with Foundry
- Configure custom prompts to use the Foundry model catalog
- Monitor agents by using Application Insights

### Test and manage agents (20–25%)

**Evaluate agent performance**
- Create a test set
- Choose an evaluation method
- Review test results

**Implement application lifecycle management (ALM) for agents in Copilot Studio**
- Create a solution
- Add existing agents to a solution
- Create and use environment variables
- Implement and extend Microsoft Power Platform Pipelines

### How the weights translate

If the exam has 50 questions, expect roughly 15–18 on planning and configuration, 20–23 on integration and extension, and 10–13 on testing and ALM. Domain 2 is the largest and, per every community review, the most hands-on. Do not skimp on Domain 3: the ALM material is the most "Power Platform" and least "Copilot Studio", and it is where builders without a Power Platform background lose points.

---

## 5. Domain 1: Plan and configure agent solutions (30–35%)

### 5.1 Plan an agent solution

#### Plan integration with enterprise systems

The exam expects you to pick the right integration pattern for a scenario. Microsoft's own decision framework, assembled from the Copilot Studio docs:

| Need | Pattern | Key facts |
| --- | --- | --- |
| Ground answers in large bodies of documents, tickets, wikis with citations and semantic ranking across Microsoft 365 | **Copilot connector** (formerly Graph connector) as knowledge | Content is copied and indexed into Microsoft Graph; admin sets it up in the Microsoft 365 admin center; honors source ACLs |
| Ground answers in live line-of-business data with no data replication | **Power Platform connector as real-time knowledge** (preview) | Only metadata (table and column names) is indexed; every query runs at runtime under the user's identity; governed by DLP |
| Ground answers in your own vector index | **Azure AI Search** knowledge source | Supports integrated vectorization and semantic ranker; one vector index per knowledge source; virtual network support |
| Perform an action or transaction in a system with an API | **Connector tool** (prebuilt or custom) or **REST API tool** (OpenAPI) | Runs under user or maker credentials; DLP governed |
| Consume tools published by a system that speaks MCP | **MCP server** tool | Streamable transport only; tools and resources supported, prompts are not; requires generative orchestration |
| Automate a system with no API (legacy desktop or web UI) | **Computer use** tool | Vision-based model drives a Windows machine; best for autonomous agents |
| Delegate a whole task to another agent | **Connected agent** (Copilot Studio, Foundry, Fabric data agent, Agents SDK) or **A2A agent** | A2A for external frameworks; Activity protocol for Agents SDK and Foundry; each connected agent has its own orchestration |
| Deterministic multi-step process with approvals | **Agent flow** | Same input always produces the same output; consumes Copilot Studio capacity per action |

The learning module "Design integration strategies for agents" frames the same choice as **tools versus knowledge versus agents**, plus choosing the authentication model. Expect questions that describe a requirement (freshness, data residency, transactions, citations, no API) and ask which option fits.

The A2A documentation includes a table you should memorize:

| Integration need | Recommended approach |
| --- | --- |
| Connect to APIs or basic HTTP services | Custom connectors / HTTP tools |
| Use MCP tools or resources | MCP servers |
| Integrate agents built with Microsoft 365 Agents SDK | Activity protocol |
| Integrate agents that already implement A2A, hosted outside Copilot Studio, with their own reasoning | A2A connection |

#### Plan identity strategy

Copilot Studio agents have three authentication options under **Settings > Security > Authentication**. Changes take effect only after you **publish**.

| Option | What it gives you | Channels | Variables available | Notes |
| --- | --- | --- | --- | --- |
| **No authentication** | Anyone with the link can chat; only public information | Web, demo website, custom app, Direct Line channels | None of the User.* auth variables | Cannot use tools that run with user credentials. Not available if a DLP policy requires authentication. Dataverse knowledge cannot be used in prompt tools for anonymous agents. |
| **Authenticate with Microsoft** | Automatic Microsoft Entra ID auth, no configuration; users are not prompted in Teams unless a wider scope is needed | **Teams + Microsoft 365 Copilot** channel (plus native and custom apps); the default for new agents | `User.ID`, `User.DisplayName` | `User.AccessToken` and `User.IsLoggedIn` are **not** available. **Require users to sign in** is always on and cannot be turned off. Required for **tenant graph grounding with semantic search**. Not available for agents integrated with Dynamics 365 Customer Service. |
| **Authenticate manually** | Microsoft Entra ID (v2 with federated credentials, certificates, or client secrets), Microsoft Entra ID, or Generic OAuth 2 (Google, Facebook, any OAuth2 provider) | Any channel | `User.Id`, `User.DisplayName`, `User.AccessToken`, `User.IsLoggedIn` | Needed for SharePoint, Dataverse, and Copilot-connector knowledge on non-Teams channels (delegated Graph scopes such as `Files.Read.All`, `Sites.Read.All`, `ExternalItem.Read.All`). With Entra ID provider you can control who can chat via **agent sharing**; with Generic OAuth2 you cannot. |

Other identity facts that appear in scenarios:

- **Require users to sign in** creates a read-only system topic and redirects to **Escalate** if sign-in fails. It is unavailable for No authentication and Authenticate with Microsoft (always on for the latter). A DLP policy can force it on.
- **Tools** run with **End user credentials** (default) or **Maker-provided credentials** (Details > Additional details > Credentials to use). Maker credentials are for shared, low-risk resources (a weather API, a support phone directory). If you share an agent whose tools use maker credentials, every user acts with the maker's access. Turning off agent authentication breaks tools that require user credentials.
- **Event triggers** can only use the **agent author's credentials**; Copilot Studio shows a warning at publish time.
- **Computer use** offers maker-provided (default, suited to autonomous agents) or end-user credentials (each user needs access to the machine).
- **Single sign-on**: connectors do not support SSO when the agent uses custom Entra ID authentication on Teams; users must authenticate to each connector. User authentication for tools is supported on custom website, Teams, SharePoint, and Omnichannel live chat, but **not** on the demo website, mobile app, Facebook, or Azure Bot Service channels.
- **Sharing for chat** requires manual authentication with Entra ID and Require users to sign in. Users need a Copilot Studio per-user license to be shared with, and the **Environment Maker** role (which includes the ChatBotReaders privilege) is assigned automatically if a System Administrator shares.
- **Microsoft Agent 365** can represent Copilot Studio agents as Entra identities governed by Conditional Access.

#### Plan channels and deployment

- You must **publish** before any channel works, and republish after every change. New content only reaches new sessions; in Teams, type `start over` to force a new session.
- Channel list: Teams and Microsoft 365 Copilot, SharePoint, WhatsApp, demo website, custom website, mobile app, Facebook, and Azure Bot Service channels (Slack, Telegram, Twilio, Line, Kik, GroupMe, Direct Line Speech, email, and others).
- Admins can restrict channels per environment with **Agent access channels** in the Power Platform admin center and with DLP connectors such as **Direct Line channels in Copilot Studio**, **Microsoft Teams + Microsoft 365 Channel in Copilot Studio**, **SharePoint channel in Copilot Studio**, **WhatsApp channel in Copilot Studio**, **Facebook channel in Copilot Studio**, and **Omnichannel in Copilot Studio**.
- Teams and Microsoft 365 Copilot availability options: install for yourself, copy an install link (works only for shared users and not on Teams mobile), show to shared users in the **Built with Power Platform** section, or **submit for admin approval** to appear in **Built for your org** (Teams) and **Built by your org** (Microsoft 365 Agent Store). Admin re-approval is only needed when you change the app details, not for content updates.
- Microsoft 365 Copilot channel limitations: no **Conversation Start** topic, no `Action.Execute` cards, no basic cards, video, image, file, or speech messages, no reactions, and Fabric data agents do not work in this channel.
- Teams limits: up to six suggested actions per question node, Adaptive Cards schema 1.5, CSAT survey is text-only, up to 20 citations per response, and knowledge sources that require end-user authentication (SharePoint) do not work in group chats or channels, only in 1:1 chats.
- The demo website is for stakeholders only, not production, and does not support tools with user authentication.
- Web channel security (Direct Line secrets) and deployed channels are **not solution-aware**; they must be reconfigured after a solution import.

#### Plan responsible AI strategy

Microsoft's guidance page frames responsible AI as fairness, accountability, transparency, and ethics, with concrete practices:

- **Transparency**: tell users they are interacting with generative AI (for example, a disclaimer in the Conversation Start topic; the docs recommend this whenever generative orchestration or AI-generated questions are on).
- **Content moderation**: levels from Lowest to Highest, default **High**. Settable at the agent level (Generative AI settings), at the generative answers node (topic level), and at the prompt tool. **Topic-level takes precedence at runtime**; if not set, the agent-level value applies. Higher moderation means fewer answers.
- **Grounding**: the **Allow ungrounded responses** setting (generative orchestration only). When off, any response produced without using a knowledge source or tool that turn is blocked and the fallback topic fires, including follow-up answers drawn from conversation history. Grounded answers require an in-text citation; if the model omits the citation, the answer is withheld. Mitigate with citation instructions and by not forcing rigid output formats.
- **Web search** (Use information from the web) uses Grounding with Bing Search and runs in parallel with public-website knowledge sources.
- **Human oversight**: human-in-the-loop flow actions (approvals, Request for information), the **Ask the end user before running** tool setting, computer use **human supervision** (email a reviewer when potentially harmful instructions are detected, with a response time limit), and connected-agent governance (audit, correlation of parent and child transcripts).
- **Feedback loops**: reactions (thumbs up/down) are on by default except on the Microsoft 365 Copilot channel, where admin consent in the Microsoft 365 admin center is needed; CSAT surveys; sentiment analysis (preview); custom metrics.
- **Testing**: evaluations with test sets, domain-mismatch tests for multi-agent solutions, and Microsoft's own pre-deployment red teaming.
- **Responsible AI FAQs** exist per feature and Microsoft recommends applying RAI policies in Foundry for bring-your-own models.

#### Evaluate security and governance considerations

Memorize the DLP connector names for Copilot Studio; they are exactly the kind of detail exams test:

| To prevent makers from... | Block this connector in a data policy |
| --- | --- |
| Publishing agents without authentication | **Chat without Microsoft Entra ID authentication in Copilot Studio** |
| Making HTTP requests (supports endpoint filtering) | **HTTP** |
| Using locally uploaded files as knowledge | **Knowledge source with documents in Copilot Studio** |
| Using public websites as knowledge (endpoint filtering supported) | **Knowledge source with public websites and data in Copilot Studio** |
| Using SharePoint or OneDrive files as knowledge (endpoint filtering supported) | **Knowledge source with SharePoint and OneDrive in Copilot Studio** |
| Connecting agents to Application Insights | **Application Insights in Copilot Studio** |
| Using event triggers, or running automated evaluations with an authenticated account | **Microsoft Copilot Studio** |
| Using skills | **Skills with Copilot Studio** |
| Publishing to a given channel | The channel connectors listed above |
| Using Power Platform connectors as tools (also blocks MCP tools, which ride on connectors) | The individual prebuilt or custom connectors |
| Using Foundry models in prompts | **Azure AI Foundry** |

Other governance facts:

- Data policies group connectors into **Business**, **Non-business**, and **Blocked**. Connectors in different groups cannot share data. New connectors land in the default group (often Non-business), which many tenants block. Enforcement is real time and has been mandatory since early 2025; a violation disables **Publish** and shows a downloadable details file.
- Governance features: environment routing, maker welcome message, customer-managed keys (CMK), Customer Lockbox (with exclusions for audit telemetry and Agent 365 events), Purview audit logs and Sentinel alerts, sensitivity labels for SharePoint knowledge, automatic security scan and real-time risk assessment before publish, agent runtime protection status, connector dependency insights, and Copilot credit caps per agent.
- Admins can disable publishing of agents that use generative AI, disable data movement outside the United States for generative AI features, and govern which agents show in Microsoft 365 Copilot from the Microsoft 365 admin center.
- **Sharing roles**: collaborative authoring (view, edit, configure, share, publish; cannot delete; requires Environment Maker), chat-only sharing (individuals, security groups, or everyone; Microsoft 365 groups must be security enabled), **Analytics viewer** (read-only Analytics page; drill-downs also need the Dataverse **Bot Transcript Viewer** security role), and **Agent viewer** (view and run evaluations, rename, cancel, delete; cannot edit test sets or the agent).
- Sharing an agent does not share its flows; share flows in Power Automate separately.
- Secret environment variables: the **Microsoft Copilot Studio Service** application needs the **Key Vault Secrets User** role, and the secret needs an `AllowedEnvironments` tag (environment IDs) or `AllowedAgents` tag (`{envId}/{schemaName}`); values are cached five minutes (30 seconds for failed reads). Anyone who can edit the agent could echo the secret in a message.

#### Plan reusable agent components

- **Component collections** bundle topics, knowledge, actions, and entities for reuse across agents in an environment and can be moved between environments in solutions (Microsoft's ALM guidance shows separate IT and HR collections consumed by a Contoso agent across DEV, TEST, and PROD with independent release cadences).
- **Connected agents** are the reuse unit for agents: an agent without connected agents can be used by many main agents; an agent that itself has connected agents cannot also be a connected agent for another main agent.
- **Custom connectors** (including MCP connectors) can be **certified and published** for use across tenants.
- **Solutions** with a custom publisher and prefix are the transport unit for everything.
- **Prompts** created in the prompt builder are reusable across agents, topics, and agent flows.

#### Design agents for internal or external audiences

| Consideration | Internal (employees) | External (customers) |
| --- | --- | --- |
| Authentication | Authenticate with Microsoft (Teams, Microsoft 365 Copilot, SharePoint) or manual Entra ID with Require sign-in | No authentication, or manual Generic OAuth2 / Entra ID (B2C-style) |
| Channels | Teams, Microsoft 365 Copilot, SharePoint | Custom website, mobile app, WhatsApp, Facebook, Direct Line, Omnichannel |
| Knowledge | SharePoint, Dataverse, Copilot connectors (require Entra identity) | Public websites, uploaded documents, Azure AI Search, custom data |
| Licensing | Usage by users licensed for Microsoft 365 Copilot is included at no charge (business-to-employee scenarios, agent running under the licensed user's identity, fair use); computer use is excluded | Copilot Credits (prepaid packs or pay-as-you-go) |
| Governance | Sharing to security groups; Purview; sensitivity labels | DLP requiring authentication may block anonymous agents entirely |

### 5.2 Create and monitor agent flows

Agent flows are deterministic automations built and billed inside Copilot Studio (standard harness). Key facts:

- **Definition**: a trigger plus at least one action. Triggers are instant, scheduled, or event-based. Action categories: AI capabilities (generate text, process documents, run a prompt, call an agent, natural-language reply to a calling agent), **Human in the loop** (approvals, Request for information), built-in tools (loops, branching, data operations, date/time, child flows), and connectors (Microsoft 365, third-party, custom).
- **Creation**: natural language or the visual designer, from the **Workflows** page (New agent flow). Agent flows live in solutions and support drafts and versioning.
- **Adding to an agent as a tool** requires the **When an agent calls the flow** trigger and a **Respond to the agent** action, **Asynchronous response off** (Networking settings of the Respond action), the flow **published**, and a response within the **100-second** action limit. Add at agent level (Tools > Add a tool > Flow) or inside a topic (Add node > Add a tool), which creates an **Action** node.
- **Input and output parameters** are defined on the trigger and the Respond action; the agent's generative orchestration can fill inputs from context or ask the user (generative slot filling).
- **Human in the loop**: **Request for information** pauses the flow, emails the assignee via **Outlook only**, cannot target users outside the tenant, supports five input types (Text, Yes/No, Email, Number, Date) with optional fields, placeholders, single-select and multi-select options, and **uses the first response only**. Approvals actions (Start and wait for an approval) are the other human-in-the-loop pattern; use **Configure run after** to branch on timeout instead of success.
- **Error handling**: standard Power Automate semantics apply: **Configure run after** (is successful, has failed, is skipped, has timed out), **Scope** actions as try/catch/finally blocks, retry policies on actions, and Terminate. Community reviewers specifically flag cloud-flow error handling as a knowledge gap in the official material.
- **Monitoring**: run history and analytics in Copilot Studio; capacity per flow under Power Platform admin center > Licensing > Copilot Studio (Agent flow actions).
- **Capacity**: 13 Copilot Credits per 100 actions. A flow called from a topic also consumes one classic answer; a flow called by generative orchestration consumes one autonomous/agent action. Test runs from the designer or the test chat are free. When prepaid capacity is exhausted, **agent flow enforcement blocks new runs** (in-progress runs finish, the agent keeps answering) until capacity is reallocated, purchased, or pay-as-you-go is enabled. Runs triggered by Microsoft 365 Copilot licensed users through **When an agent calls the flow** are no-charge; other triggers bill normally.
- **Converting** a Power Automate cloud flow to an agent flow (change plan to Copilot Studio in the flow's details page) is **one-way** and requires the flow to be in a solution and capacity to exist in the environment. Cloud flows themselves use Power Automate licensing, not credits.
- **Prompts** can be added inside agent flows under AI capabilities > Run a prompt.

### 5.3 Configure topics

#### Add agent flows and tools to a topic

Add node > **Add a tool**, then choose from Basic tools, Connector, or Tool tabs. A flow appears as an Action node; connector tools use user credentials by default. Topics can also **redirect to a child or connected agent** (except Fabric data agents) and pass inputs and receive outputs.

#### Configure agent response formatting

- Message nodes support Markdown (partially on Teams, Facebook, and Omnichannel), variables, and Adaptive Cards.
- Under generative orchestration, a topic should **return results as output variables** instead of sending a final Message node, so the orchestrator can compose one contextual response. Return an "answered" state output to prevent the orchestrator from answering the same request twice.
- Tool completion options (**After running**): Don't respond (default, output goes back to the orchestrator), Write the response with generative AI, Send specific response (templated with variables and Power Fx), or Send an adaptive card. Child agents have the same four options.
- Generative answers customization: store the answer in a global variable, clear **Send a message**, and render it yourself (for example in an Adaptive Card). In Teams, citations are then **not** rendered automatically; set **Save LLM response** to **Complete** and emit a `SendActivity` with `citationEntities` in the code editor.

#### Configure advanced agent responses with custom prompts

- Prompts are built in the embedded **prompt builder** (AI Builder). Add them as an agent tool (New tool > Prompt), as a topic node (Add a tool > New prompt), or as an agent-flow action.
- Configure instructions (manually, with Copilot, or from the prompt library), model and settings (temperature, knowledge retrieval, links in responses, code interpreter, reasoning), inputs (text, images, documents, with sample data), Dataverse **knowledge**, and output formatting (text or JSON).
- **Anonymous agents cannot use Dataverse tables as prompt knowledge.**
- **Bring your own model** from the Foundry model catalog: in the Model dropdown select **+**, enter the **model deployment name** and **base model name** exactly as they appear in Foundry and the endpoint. The endpoint must be the **chat completions** endpoint (`.../chat/completions`); the Responses API endpoint (`/openai/v1/responses`) fails with "Resource not found". **GPT-5 family models are not supported** for bring your own model. With image inputs the dropdown only lists vision-capable models (Phi-3.5-vision, Phi-4-multimodal, GPT-4o, GPT-4o-mini, GPT-4, GPT-4.5-preview, o1). Governance: the **Azure AI Foundry** connector in Power Platform DLP; bring-your-own-model usage is billed separately from Copilot Credits.
- Content moderation for prompts can be overridden with the tool's **Completion** settings.
- Best practices from the docs: be specific, give examples, keep prompts short (long prompts cause latency and timeouts), and give the model a way out ("respond with 'not found' if the answer isn't present").

#### Configure advanced agent responses with custom knowledge sources and the generative answers node

- The node lives under Add node > Advanced > **Generative answers**. It is also what the **Conversational boosting** system topic uses as the agent-level fallback; agent-level knowledge sources are automatically part of it.
- **Sources defined in a node override agent-level sources**, which act as fallback. **Search only selected sources** (off by default) restricts the node to the sources you pick; with it on, trigger conditions on those sources are ignored and there is **no fallback** to other agent sources.
- **Classic data** options are only available in the node, not at agent level: **Azure OpenAI on your data**, **Bing Custom Search**, and **Custom data** from a variable. To answer only from a variable, turn on Search only selected sources with nothing selected, set Custom data to the variable, and turn off web search and general knowledge. Include `ContentLocation` and `Title` fields in custom data so citations work.
- Input defaults to `Activity.Text`. Outputs can go to a variable instead of being sent.
- Authentication: SharePoint, Dataverse, and Copilot connectors need the agent user's Entra identity; on non-Teams channels this means manual authentication with Entra ID and delegated Graph permissions `Files.Read.All` and `Sites.Read.All` (and `ExternalItem.Read.All` for Copilot connectors).
- Generative answers read modern SharePoint pages, DOCX, PPTX, and PDF.
- Under classic orchestration the boosting topic has per-type limits (5 Azure OpenAI connections, 2 Bing Custom Search IDs, 3 custom data sources, 2 Dataverse sources with up to 15 tables each, 4 SharePoint URLs, 4 website URLs, unlimited uploaded files). Under generative orchestration, sources beyond 25 are filtered by an internal model, uploaded files do not count toward 25, and custom data and Bing Custom Search are only usable inside a node.
- **Official sources** (marking a source as trusted) do not work with generative orchestration.
- Citations can appear differently per channel (Teams: at most 20, title around 80 characters, snippet around 480 characters). Citations from a knowledge source cannot be used as inputs to other tools.

#### Configure advanced agent responses with API and Send HTTP requests

The **Send HTTP request** node (Add node > Advanced):

- Methods: **GET, POST, PATCH, PUT, DELETE**.
- Headers as key/value pairs (for example `Authorization: Bearer <token>` using `User.AccessToken` from manual authentication).
- Body: **No content** (default, typical for GET), **JSON content** (editable as JSON or as a Power Fx object, letting you insert variables), or **Raw content** (a Power Fx string of any content type).
- Response data type: **From sample data** (paste a sample JSON response, get a typed Power Fx record with IntelliSense), or other types; save the response to a new or existing variable.
- Error handling: default **Raise an error** (stops the topic and triggers the **On Error** system topic). **Continue on error** stores the HTTP status code and error response body into variables you choose (the error response is type Any; use a **Parse value** node to convert it). **Request timeout** defaults to **30 seconds** (set in milliseconds).
- Governance: the DLP **HTTP** connector can block the node or restrict it with **endpoint filtering**; a violation appears as a row per node in the publish details file.

#### Configure adaptive cards

- Schema support: **1.6 and earlier**, but the target host decides: Web Chat supports 1.6 without `Action.Execute`; **Teams and the Omnichannel live chat widget are limited to 1.5**; the Copilot Studio canvas only renders 1.6 cards in the test chat.
- **Ask with Adaptive Card** node: for interactive cards. The card **must contain at least one submit button**; Copilot Studio automatically creates **output variables** from the card's input fields (fix them with **Edit Schema** if wrong). Properties: reprompts (default up to 2), custom retry prompt, and **Allow switching to another topic** (interruptions; the card is resent afterward).
- Non-interactive cards go in **Message** or **Question** nodes.
- Author with the built-in designer, JSON, or a **Power Fx formula** for dynamic content. Switching to Formula converts the JSON and is **one way**; keep a copy of the JSON.
- For consecutive cards, put a unique identifier in each `Action.Submit` data payload (for example `actionSubmitId`) and, in custom web chat, disable buttons after the first click.
- Microsoft 365 Copilot does not support `Action.Execute`; Teams renders up to six suggested actions.

#### Manage variables

- Scopes: **Topic** (`Topic.`), **Global** (`Global.`, can be set from external sources such as query strings; cannot be converted back to topic scope), **System** (`System.`, for example `System.Activity.Text`, `System.Activity.ChannelData`, `System.User.*`), and **environment variables** (`Env.`) for solution-aware configuration and secrets.
- Question nodes auto-create typed variables; **Set variable value** for literals, other variables, or Power Fx (needed for Table and Record types). Literal `123` is a number; `"123"` is a string.
- **Pass variables between topics**: mark a variable **Receive values from other topics** or **Return values to original topics**; Redirect nodes expose inputs and outputs. Date/time, duration, multiple-choice, and custom-entity variables cannot be passed between topics in the Teams-plan experience.
- **Parse value** node converts a string (JSON) or untyped object into a typed **Record** using a sample; use it for API responses, event payloads, and `System.Activity.ChannelData`.
- **Topic inputs and outputs** (Details pane) let generative orchestration fill inputs automatically (Dynamically fill with the best option, or Set as a value), require an entity type under Identify as, and support **Should prompt user**.
- **Clear variable values** node can clear **Conversation history for the current session**; the Reset Conversation system topic clears global variables but not conversation history.
- Node names can be up to 500 characters; Trigger and Go to step nodes cannot be renamed.

---

## 6. Domain 2: Integrate and extend agents in Copilot Studio (40–45%)

### 6.1 Connect to enterprise knowledge sources

Baseline table from the knowledge docs:

| Source | Authentication | Generative-mode limit |
| --- | --- | --- |
| Public website (Bing-scoped) | None | 25 websites (classic: 4) |
| Uploaded documents (Dataverse) | None | All documents |
| SharePoint (Graph search) | Agent user's Entra ID | 25 URLs (classic: 4 per node) |
| Dataverse | Agent user's Entra ID | Unlimited (classic: 2 sources, 15 tables each) |
| Enterprise data via connectors indexed by Microsoft Search (Copilot connectors) | Agent user's Entra ID | Unlimited (classic: 2 per agent) |

#### Copilot connectors

- Formerly Microsoft Graph connectors. A **tenant admin configures them in the Microsoft 365 admin center** (schema, semantic labels, indexing); the maker then chooses them under **Add knowledge** (use **Advanced** if not listed; if still missing, ask the admin).
- Content is **copied and indexed into Microsoft Graph**, honoring source ACLs; answers include **citations**; the same index powers Microsoft Search and Microsoft 365 Copilot.
- Best for documents, knowledge bases, tickets, and wikis (ServiceNow KB, Jira, Confluence, GitHub, Azure DevOps).
- For best results have a Microsoft 365 Copilot license in the tenant and turn on **tenant graph grounding with semantic search** (10 Copilot Credits per message for unlicensed users; requires **Authenticate with Microsoft**; supports files up to 200 MB, or 512 MB for PDF, PPTX, DOCX).
- When publishing to channels with manual authentication, add the **`ExternalItem.Read.All`** scope.

#### Power Platform connectors as knowledge (real-time, preview)

- Supported: Salesforce, ServiceNow, Azure SQL, Azure AI Search, SharePoint, Dataverse, Dynamics 365, Snowflake, Databricks, Zendesk, Confluence (Cloud only), Oracle Database, SAP OData, Google Sheets.
- **No data movement**: only table and column metadata is indexed; every request executes at runtime against the source, **authenticated with the user's own tokens**, so source access controls are preserved.
- Add via Add knowledge > (Advanced >) real-time connector > sign in > pick tables > name and description > synonyms and glossary (only **ServiceNow and Zendesk** support synonyms) > Add to agent. Status goes In progress then Ready.
- Governed by the same **data policies** as connector tools.

#### Copilot connectors versus Power Platform connectors (decision guide)

| Dimension | Copilot connectors | Power Platform connectors |
| --- | --- | --- |
| Mechanism | Index then answer (semantic index in Microsoft Graph) | Live API bridge at runtime |
| Data movement | Yes, copied and indexed | No |
| Best for | Broad searchable content, citations, reuse across Microsoft 365 | Up-to-the-minute facts, transactions, data that must not be replicated, custom APIs |
| Setup and control | Microsoft 365 admin center; indexing quotas; Microsoft 365 licensing | Power Platform connections per environment; DLP; standard, premium, custom connectors |
| Latency | Low (served from index) | Depends on the target API |
| Citations | Yes | Not inherent |

Common pitfalls in the docs: connector missing in Copilot Studio (admin has not created it, or look under Advanced), works in Teams but not Copilot Studio (missing `ExternalItem.Read.All` scope or authentication mismatch), low-quality answers (check semantic labels, indexing completeness, and the Work IQ / tenant graph grounding setting).

#### Azure AI Search

- Create the service, a **vector index using integrated vectorization** (Import and vectorize data) so the same embedding model vectorizes the prompt at runtime, and optionally the **semantic ranker** (configured in Azure before adding the connection).
- Add via Add knowledge > Featured > Azure AI Search > Create new connection. Authentication types: **Access key**, **Client certificate**, **Service principal (Entra ID application)**, **Microsoft Entra ID integrated**. Then pick **one vector index** per knowledge source.
- **Do not manually configure an endpoint and API key**; add it only through a data connection. A broken connection is environment-scoped and can break the dialog for all agents; recovery means resetting the agent's external access or recreating the agent, and re-adding with Entra ID authentication.
- **Citations**: include a URL field in the index; `metadata_storage_path` is used automatically if present, otherwise any field containing a full URL. Users need access to whatever the citation points to.
- **Virtual network support**: private endpoints on the search service plus Power Platform VNet support.
- Azure AI Search can also be used through **Azure OpenAI on your data** in a generative answers node (classic data), which is the "Azure AI Search with Foundry" path covered under Domain 2.4.

### 6.2 Add tools to agents

General tool facts (add-tools docs):

- Tool types: Connector (prebuilt standard or premium, custom), Agent flow, Prompt, REST API, Model Context Protocol, Computer use; tool-like: Azure Bot Service skills, client tools (event activities).
- Tool details: **Allow agent to decide dynamically when to use the tool** (clear it to restrict the tool to explicit topic calls or child-agent instructions), **Ask the end user before running** (off by default), **Authentication** (end user or maker-provided), inputs (**Dynamically fill with AI**, or **Custom value** via literal, variable, or Power Fx; plus identify-as entity, retry logic, validation), and completion behavior.
- Limits: generative orchestration handles at most **128 tools per agent**; Microsoft recommends **25–30**. Child agents have their own separate 128-tool limit.
- Descriptions drive selection: active voice, present tense, keywords, unique names ("Weather Forecast" not "Weather"), and state what a tool does not do.

#### Configure and monitor computer use

- What it is: an agent tool that drives a **Windows** machine (websites and desktop apps) with a virtual mouse and keyboard, powered by computer-using agent (CUA) models; works when there is no API. Requires **generative orchestration**.
- Configuration fields: Name, Description, **Model** (OpenAI CUA standard GA; Anthropic Claude Sonnet 4.5 standard GA; Claude Sonnet 4.6 standard experimental; Claude Opus 4.6 premium experimental; Anthropic models need the admin to allow **external models** for the environment), Instructions (full URLs, exact app names, explicit actions, numbered steps), optional **Inputs**, **Machine**, Connection, **Credentials to use** (maker-provided default, or end user), **Human supervision** (Outlook reviewer plus response time limit), **Stored credentials** (internal storage or **Azure Key Vault**; website domain with wildcards or desktop process name), **Access control** allow list (prevents actions on, not opening of, other sites), and **Enforce HTTPS**.
- Where it runs: **Hosted browser** (preview, Windows 365 for Agents, Microsoft-managed, not Entra joined, not for production, may be throttled), **Cloud PC pool** (preview, Windows 365 for Agents, auto-scaling, Entra joined and Intune enrolled), or **bring your own machine** (Power Automate for desktop **2.61.132.25266 or later** with the web extension, registered via the machine runtime app, then **Enable for computer use** in the machine settings). Runs on a busy machine are **queued** and run sequentially (Run queue page).
- Testing shows step-by-step reasoning on the left and a machine preview on the right; **Stop testing** halts actions.
- Best fit: **autonomous agents**. In conversational agents with user authentication, every user needs machine credentials, and reasoning messages and screenshots are shared in the chat.
- Security best practices: dedicated isolated machines, least-privilege accounts, browser allow lists (Edge policies via Intune), application control.
- Billing: each **step** costs **5 Copilot Credits** (standard model) or **15** (premium); billed as an agent action; **not included** in the Microsoft 365 Copilot license.
- Data extraction: ask for plain text or valid JSON; combine with other tools (email) via agent instructions.

#### Configure MCP tools

- MCP gives access to **tools and resources** (not prompts). Tool definitions come from the server and update dynamically. Requires **generative orchestration**.
- Transport: **Streamable HTTP only**. SSE was dropped after August 2025 because the specification deprecated it.
- Two ways to connect: the **MCP onboarding wizard** (Tools > Add a tool > New tool > Model Context Protocol; server name, description, URL; authentication **None**, **API key** (header or query parameter name), or **OAuth 2.0** with **Dynamic discovery** (DCR with discovery), **Dynamic** (DCR without discovery; provide authorization and token URLs; copy the callback URL into your app registration), or **Manual** (client ID, secret, authorization, token, refresh URLs, scopes)), or a **custom connector in Power Apps** from an OpenAPI 2.0 YAML whose operation carries `x-ms-agentic-protocol: mcp-streamable-1.0`.
- Alternatively register the server in **Agent 365** (Agents 365 CLI and Microsoft 365 admin center) as a bring-your-own MCP server.
- Per-tool control: **Allow all** toggle; when off, new server tools are disabled by default. Resources are only usable if the server exposes them as tool outputs.
- Governance: MCP runs on Power Platform connectors, so **DLP policies on connectors govern MCP** access.
- **Dataverse MCP server** (preview) tools: `create_record`, `describe_table`, `list_tables`, `read_query`, `update_record`, `create_table`, `update_table`, `delete_table`, `delete_record`, `search`, `fetch`. Requires a **Managed Environment** and admin enablement of MCP clients in the Power Platform admin center; tool names may change during preview.
- Not supported: hierarchical Azure Boards through MCP or the Azure DevOps connector.

#### Add a tool by using an existing custom connector

- Custom connectors wrap any public API using an OpenAPI definition and are created in Power Apps (Tools > New tool > Custom connector opens the portal). Connections use user credentials by default; switch to **Maker-provided credentials** under the tool's Additional details after configuring an authenticated channel.
- Share connections from make.powerapps.com > Connections > Share (Can use + share).
- Custom connectors must be **imported before** the connection reference and agent solution during ALM, and can be **certified** for cross-tenant use. They support environment variables.
- Prebuilt connectors are **standard** (all plans) or **premium** (select plans).

#### Add REST APIs to an agent (preview)

Sequence to memorize (drag-and-drop candidate):

1. Tools > Add a tool > **New tool > REST API**.
2. Upload the **OpenAPI v2 JSON** specification (v3 is auto-translated to v2).
3. Improve the **description** (synonyms, what it does), and pick a **solution** (blank creates one with the default publisher).
4. Choose authentication: **None**, **API key** (parameter label, name, location header or query), or **OAuth 2.0** (client ID and secret, authorization, token, refresh URLs, scope, which Microsoft 365 organizations, which client app GUIDs).
5. Select and configure individual **tools** (operations): name, description, review parameter descriptions (all must be filled).
6. Review and publish, then **create a connection** and add each tool to the agent.

Only expose the operations users should have (for example create but not delete).

### 6.3 Configure multi-agent collaboration

#### Design multi-agent solutions

| Use **child agents** when | Use **connected agents** when |
| --- | --- |
| Single use case or intent (create a ticket, check status) | Tool selection degrades because the main agent has **more than 30–40 actions** (tools, topics, agents), or descriptions overlap |
| One developer or small team owns everything | Multiple teams own different agents |
| You want to group tools, instructions, and knowledge into subagents that share the main agent's settings | Agents need their own settings (model), independent publishing and channels, independent ALM |
| No separate auth, deployment, or reuse needed | The agent must be reusable by many main agents |

Trade-offs: extra orchestration hops add latency; more agents mean a larger testing, management, and governance surface. Microsoft's guidance: start with one agent and split only when you see a clear need.

Child agent details: created under **Agents > Add > New child agent**; instructions can reference tools, variables, and Power Fx with `/`; own knowledge and tools; triggers (**When will this be used?**: message received, custom client event, activity, conversation update, invoked, redirected, user inactive, plan completes, AI-generated response about to be sent with `Response.FormattedText` and `ContinueResponse`); **Condition** and **Priority** (lower number is higher priority; order of execution is activity triggers, then message/event/conversation/invoke triggers, then "the agent chooses"); inputs (required, Should prompt user, reprompts up to 2, conditions, action if no entity found) and outputs; **After running** options (Don't respond, Write with generative AI, Send specific response, Send an adaptive card). Child agents always receive the parent's context; when the parent has no topics or knowledge and After running is Don't respond, the runtime may emit a system `explanation_of_tool_call` message.

Orchestration best practices (multi-agent patterns guidance):

1. Single response principle: only the parent talks to the user.
2. Subagent instructions must state that they are subagents and must not reply directly.
3. Use directive language (MUST, NEVER, ONLY); soft wording loses priority.
4. One non-overlapping knowledge source per subagent.
5. Accurate, distinct descriptions (the parent routes on them).
6. Parent instructions define the pattern: invoke, wait, combine, respond.
7. Include "return findings only" in the delegated task.
8. Test with domain-mismatch queries.
9. Prefer ask over inform when expecting a follow-up.

Known limitations: an agent with connected agents cannot itself be a connected agent; citations may be lost when outputs pass back to the caller; child and connected agents respect the main agent's **Use general knowledge** setting.

#### Integrate an existing Copilot Studio agent

Prerequisites: same **environment**, **published**, **Let other agents connect to and use this one** turned on in the other agent's settings (on by default), and the maker owns it or has it shared. Optionally clear **Pass conversation history to this agent** to send only the explicit task. The description is copied locally and does not sync; connected agent changes only apply after that agent is republished. Depending on authentication, you may need to share the connected agent with end users.

#### Integrate a Foundry agent (preview)

- Prerequisite: the Foundry agent must have the **Activity protocol** endpoint enabled. New Foundry agents expose only **Responses** and **A2A** by default; without Activity the connection fails at runtime with a **400** ("endpoint does not support activity"). Enable it **programmatically** (REST API or Python SDK); the portal still shows only Responses and A2A afterward, which is expected.
- Only agents created in the **new Foundry portal** work (old-portal agents return "404 Version not found").
- Steps: Agents > Add an agent > Microsoft Foundry > create a connection with the **Foundry project endpoint URL** > name and description > **Agent Id** > Add Agent. Description is the routing signal.
- Foundry roles were renamed: Azure AI User is now **Foundry User**; A2A callers need the **Foundry Agent Consumer** role.

#### Integrate a Fabric data agent (preview)

- Fabric data agents answer natural-language questions over OneLake data by generating **read-only** SQL, DAX, or KQL (and Microsoft Graph queries) against up to five sources: lakehouse, warehouse, Power BI semantic model, KQL database (including Eventhouse), mirrored database, ontology. Prerequisites in Fabric: paid **F2 or higher** (or P1 with Fabric enabled), cross-geo AI tenant settings, read access to the sources.
- Connect in Copilot Studio: Agents > Add an agent > Microsoft Fabric > connection > pick the data agent you can access > refine the description.
- Limitations: **cannot be redirected to from a topic**, cannot be referenced explicitly in instructions, **does not function when the main agent is deployed to Microsoft 365 Copilot**, no unstructured data, English only, responses capped at 25 rows and 25 columns, source and data-agent capacities must be in the same region.

#### Create a multi-agent solution using A2A

- A2A is an open standard for agent-to-agent communication: send tasks, receive structured responses, multi-turn, rich metadata, interoperable across frameworks.
- Add: Agents > Add agent > **A2A agent** > **endpoint URL** (the message endpoint, **not** the agent card URL). If the card exists at `<endpoint>/.well-known/agent.json`, name and description populate automatically; otherwise enter them manually. Authentication: **None**, **API key** (header or query), **OAuth 2.0** (client ID, secret, authorization, token, refresh URLs). Then pick or create a connection and Add and configure.
- A2A connections use the **custom connector infrastructure**, so on-premises or virtual-network agents can be reached.
- Payload: `contextId`, message IDs, locale, **full chat history** under `copilotstudio.microsoft.com/a2a/chathistory`, and content parts.
- The sample lives at `CopilotStudioSamples/extensibility/a2a/Simple-A2A-Sample` (.NET, Azure OpenAI, Dev Tunnels for local exposure; production should be a secure web app).
- Foundry can expose agents over A2A: GA **v1.0** (JSON-RPC only) and preview v0.3; Entra ID authentication required; agent card at `.../endpoint/protocols/a2a/agentCard/v1.0`; text modality only; no streaming.
- Agents SDK agents connect through the **Activity protocol** at their messaging endpoint (defaults to `/api/messages`).

### 6.4 Integrate agents with Azure

#### Generative answers with Azure AI Search through Foundry (Azure OpenAI on your data, preview)

- Connect a data source to a model using **Azure OpenAI Service in Microsoft Foundry** (Add your data with an Azure AI Search index), then either **Deploy to > A new Microsoft Copilot Studio bot** (creates an agent with a Conversational boosting topic already wired) or, in an existing topic, open the generative answers node **Data source** pane > **Classic data** > **Add connection** to the Azure OpenAI resource and edit connection properties.
- Node-level sources take priority over agent-level knowledge.

#### Custom prompts with the Foundry model catalog

Covered in 5.3: chat-completions endpoint, deployment and base model names, no GPT-5 family, Azure AI Foundry DLP connector, separate billing.

#### Monitor agents with Application Insights

- **Settings > Advanced > Application Insights > Connection string**. Toggles: **Enable logging** (incoming and outgoing messages and events), **Log conversation details** (user ID, name, message text; also tool inputs and outputs when OpenTelemetry tracing is on), **Log sensitive Activity properties**, **Node execution events** (one event per topic node).
- Telemetry lands in **customEvents**; use Kusto (KQL). Channel and activity data sit in **customDimensions** (`type`, `channelId`, `fromId`, `fromName`, `locale`, `text`, and **`designMode`**, which is `True` for test-canvas conversations, so filter `customDimensions['designMode'] == "False"` to exclude tests). Unique-user counts are only meaningful for authenticated users.
- A **Copilot Studio Dashboard** workbook (preview) in the Application Insights Workbooks gallery shows conversations, latency, exceptions, tool usage, and topic analytics; viewers need at least Reader on the resource.
- Governance: block the **Application Insights in Copilot Studio** DLP connector. Application Insights settings are **not solution-aware** and must be re-entered after deployment. Environment-level telemetry (preview) also exists.

---

## 7. Domain 3: Test and manage agents (20–25%)

### 7.1 Evaluate agent performance

#### Create a test set

- Location: the agent's **Evaluation** page > **New evaluation** > **Single responses** (one unconnected question per case) or conversational multi-turn evaluation.
- A single-response test set holds **up to 100 test cases**. Test results are kept **89 days**; export to CSV to keep longer.
- Ways to create cases: **Quick question set** (10 AI-generated questions from the agent's description, instructions, capabilities), **Full question set** (generate from knowledge sources or topics; choose the count; knowledge works best for generative orchestration, topics for classic), **test chat conversation** (latest test chat, or the evaluate icon in the test chat), **import a file**, write questions manually, or from **themes** in analytics (production questions).
- Generation sources: text, Word, Excel, PDF, individual SharePoint files (not folders) up to **5 MB**. Generation fails if a generated question trips content moderation.
- Import file: CSV or TXT, headers **Question** and **Expected response** in that order, up to 100 questions, each **1,000 characters** or less. Expected responses are optional for import but required for match, similarity, and compare-meaning methods.
- **Manage profile and connections**: choose the account used to reach knowledge and tools; generated cases may contain data that account can see; all makers of the agent can see the test sets.

#### Choose an evaluation method

| Method | Measures | Test set type | Scoring | Needs |
| --- | --- | --- | --- | --- |
| **General quality** (default on every set) | LLM judgment on relevance, groundedness, completeness, abstention; must meet all | Single or conversation | Score out of 100% | Nothing |
| **Compare meaning** | Semantic similarity of intent to the expected answer | Single | Score out of 100%, **default pass score 50** | Pass score, expected answer |
| **Tool use** | Whether the expected tools or topics were used | Single | Pass/fail | Expected capabilities |
| **Keyword match** | Whether **Any** or **All** expected keywords appear | Single or conversation | Pass/fail | Keywords |
| **Text similarity** | **Cosine similarity** of wording (0 to 1); for near-exact wording such as legal text | Single | Score out of 100% | Pass score, expected answer |
| **Exact match** | Character-for-character match; for codes, numbers, fixed phrases | Single | Pass/fail | Expected answer |
| **Custom** | Your own evaluation instructions and two or more labels, each mapped to pass or fail | Single or conversation | Pass/fail | Name, instructions, labels (restricted character set for label titles) |

Cases without required expected values return **Invalid**. Reducing knowledge sources does not guarantee better general-quality scores.

#### Review test results

- Run from the set (Evaluate) or rerun from **Recent results**. Results stream line by line; you can stop a run; **only one evaluation runs at a time**; runs take a few minutes.
- Each case gets **Pass, Fail, Invalid, or Error**; the set gets a **Pass rate**. Details show expected and actual responses, reasoning, resources used, an **activity map**, and **response time** in seconds (measurement only, no effect on pass rate). Rate the evaluation's judgment with thumbs up or down.
- **Compare with** another run of the same set shows which cases improved or regressed.
- **Export** to CSV (question, expected response, method, pass score, response, result, analysis).
- Only the maker who ran a test sees the responses and explanations; others see status and metrics. Share with the **Agent viewer** role for evaluators.
- Evaluations that use user authentication depend on the **Microsoft Copilot Studio** connector; if DLP blocks it, tests cannot run. Evaluations can also be run through the Power Platform API or connectors in automation.
- Complementary runtime analytics on the **Monitor** page: conversation outcomes (Resolved confirmed or implied, Escalated system intended, system unintended, or user requested, Abandoned after 30 minutes), reactions, CSAT, sentiment (preview), connected and child agent call volumes and success rates, themes, generated answer rate and quality, tool use, knowledge source use, custom metrics (up to three), and 360 days of history.

### 7.2 Implement ALM for agents

#### Create a solution and add existing agents

- Requires at least the **System Customizer** role. Create the solution in the Copilot Studio solution explorer (unmanaged by default, with a custom publisher and prefix), then **Add existing > Agent > Agent**.
- After adding components (topics, flows) in Copilot Studio, use **Advanced > Add required objects** on the agent, the workflows, and the environment variables so dependencies travel.
- **Managed solutions cannot be exported**; if you make one managed you need a new solution. Deploy managed solutions to non-development environments and keep unmanaged only in development.
- Export blockers and gaps: topic names containing a period (`.`), agents with more than 250 topics or 100 entities need the classic export experience, comments do not export, some bot properties (conversation ID, CDS bot ID, environment ID) and the icon and channel details do not transfer, and custom topics or knowledge stored separately may need separate handling.
- Import order: **custom connectors first**, then the connection reference and agent solution. After import, **reconfigure user authentication** and **publish** before sharing; the icon may take 24 hours.
- Do not edit or remove agent components directly in the solution; do it in the Copilot Studio UI. Removing an agent from a solution does not remove its components.
- **Not solution-aware** (needs post-deployment configuration): Azure Application Insights settings, manual authentication settings, Direct Line and web channel security, deployed channels, sharing.
- ALM golden rules: customize only in development, always work inside solutions, custom publisher and prefix, separate solutions only when components deploy independently, environment variables for settings and secrets, export and deploy managed, automate with pipelines, Azure DevOps, or GitHub, and use Git integration.
- Environment strategy: at least development, test, and production; production is a production-type environment, others sandbox; secure each with an Entra security group.

#### Create and use environment variables

- Types: **Decimal number, Text, JSON, Two options (Yes/No), Data source, Secret**. Data source variables need a connector, connection, and parameter type (SharePoint site and list, SQL server and database for Entra connections; not for basic SQL auth, which belongs in connection references).
- **Default value** (definition) versus **Current value** (value record). A current value wins over the default. **Remove the current value from the solution before export** (Current Value > Remove from this solution) so the import prompts for the target value; values otherwise export as separate JSON files. Values in managed solutions are only visible in the Default solution and can only be deleted by shipping an upgrade that omits them.
- Import and pipelines prompt for values without defaults and label the source (solution, target environment, default). Up to an hour for new values to propagate to apps and flows. Maximum 2,000 characters. Reserved names `$authentication` and `$connection` block flow saves.
- **Secrets** reference Azure Key Vault; the subscription needs the PowerPlatform resource provider registered; Copilot Studio needs the Key Vault Secrets User role and the `AllowedEnvironments` or `AllowedAgents` tags described in 5.1. Environment variables are usable in custom connectors.

#### Implement and extend Power Platform pipelines

- Concepts: a **pipelines host** environment (a production-type environment; does not need to be managed) runs the **Deployment Pipeline Configuration** app; pipelines have stages linked to **development** and **target** environments. **All target environments must be Managed Environments** (Microsoft began auto-enabling this in February 2026), and managed environments need premium licenses. The **Deployment Pipeline Administrator** role enables the Manage pipelines button.
- Behavior: makers deploy from an **unmanaged solution in the development environment** (pipelines are not visible from managed solutions, the default solution, or target environments). The solution is exported on request and the **same artifact** passes through every stage in order (no bypassing QA). Only **managed** solutions are deployed; unmanaged backups are stored in the host. Import behavior is Upgrade without overwrite; previous versions can be redeployed if the setting allows. Connections, connection references, and environment variable values are validated up front. No Dataverse data, no cross-tenant deployment (use Azure DevOps or GitHub), one solution per deployment, cross-region only if enabled in the host.
- **Delegated deployments** run as a **service principal** or pipeline owner and support **approvals**; the deploying identity owns the deployed components.
- **Extend pipelines** with Power Automate using the pipeline events (pre-deployment and post-deployment hooks such as OnPreDeploymentStarted and OnDeploymentCompleted) for gating, notifications, and integration with Azure DevOps, GitHub, or the ALM Accelerator; the **`pac pipeline`** CLI lets developers list and run pipelines.
- Comparison: **Azure DevOps** (full ALM, Build Tools, highest setup effort), **GitHub Actions for Power Platform** (import/export, environment provisioning, Solution Checker), **Pipelines** (centralized, low setup, built for makers). Git integration adds source control with audit trails.

---

## 8. Cross-cutting facts you must know cold

**Copilot Credits billing (standard harness)**

| Feature | Credits | Included for Microsoft 365 Copilot licensed users? |
| --- | --- | --- |
| Classic answer | 1 | Yes |
| Generative answer | 2 | Yes |
| Agent action (triggers, deep reasoning, topic transitions, computer use steps) | 5 (15 per step for premium computer-use models) | Yes, except computer use |
| Tenant graph grounding | 10 per message | Yes |
| Agent flow actions | 13 per 100 actions | Yes, only for the When an agent calls the flow trigger |
| Text and generative AI tools | 1 / 15 / 100 per 10 responses (basic / standard / premium) | Yes |
| Reasoning model use | feature rate plus premium tools rate per 1,000 tokens | |

General overage enforcement disables custom agents at **125%** of prepaid capacity (admins are emailed and notified in the admin center); agent flow enforcement only blocks new flow runs. Per-agent monthly caps can be set under Licensing > Copilot Studio > Manage Agents. Bring-your-own Foundry models are billed separately.

**Generative versus classic orchestration**: generative selects topics, tools, agents, and knowledge by **description** and can chain several and generate questions for missing inputs; classic matches **trigger phrases** to one topic and uses knowledge only as fallback. Generative is the default for new agents; admins can disable it per environment. Generative orchestration does not use the Conversational boosting topic, does not support custom entities as tool inputs, and does not invoke the Multiple Topics Matched topic.

**Limits to remember**: 128 tools per orchestrator (25–30 recommended); 25 knowledge sources before filtering; 100 test cases; 1,000 characters per test question; 89-day evaluation retention; 360-day analytics; 100-second flow response; 30-second HTTP timeout; 2,000-character environment variable; 5-minute secret cache; 25 rows and columns from a Fabric data agent; six suggested actions and 20 citations in Teams; Adaptive Card 1.5 in Teams and 1.6 in Web Chat.

**Preview versus GA as of September 2026 (check before your exam)**: REST API tools, Power Platform connectors as knowledge, Azure OpenAI on your data in generative answers, Foundry agent connection, Fabric data agent connection, Agents SDK agent connection, Dataverse MCP server, hosted browser and Cloud PC pool for computer use, sentiment analysis, and the Application Insights workbook are documented as preview. MCP, A2A, computer use (bring your own machine), child agents, connected Copilot Studio agents, evaluations, Azure AI Search knowledge, Copilot connectors, agent flows, and pipelines are GA.

---

## 9. Sample questions

These questions are original and modeled on Microsoft's documented behavior. They are not actual exam items. Answers and explanations follow each question.

### Domain 1: Plan and configure

**Q1.** A retail company publishes a Copilot Studio agent to its public website. Anonymous shoppers must be able to chat, but a "Check my order" tool must run as the signed-in shopper using the company's own OAuth 2.0 identity provider. Which authentication option should you configure?

A. No authentication
B. Authenticate with Microsoft
C. Authenticate manually with Generic OAuth 2
D. Authenticate manually with Microsoft Entra ID and Require users to sign in

**Answer: C.** Tools cannot use user credentials when the agent uses No authentication. Authenticate with Microsoft only works on the Teams and Microsoft 365 channels. Generic OAuth 2 under Authenticate manually supports any OAuth2 provider and any channel, and with Require users to sign in turned off the agent only prompts when a topic needs it. D forces Entra ID, which external shoppers do not have.

**Q2.** An agent uses Authenticate with Microsoft. A topic references `User.AccessToken` to call Microsoft Graph. What happens?

**Answer:** The variable shows as **Unknown** and the topic errors. Only `User.ID` and `User.DisplayName` are available with Authenticate with Microsoft. To get an access token, switch to Authenticate manually.

**Q3. (Yes/No series)** Goal: An agent flow must be callable as a tool from a Copilot Studio agent.
- Solution 1: Create a cloud flow with a manual trigger and a Respond to Power Apps action. **No.** The flow needs the When an agent calls the flow trigger and a Respond to the agent action.
- Solution 2: Create an agent flow with the When an agent calls the flow trigger, a Respond to the agent action with Asynchronous response turned on, and publish it. **No.** Asynchronous response must be off; the flow must respond within 100 seconds.
- Solution 3: Create an agent flow with the When an agent calls the flow trigger and a Respond to the agent action with Asynchronous response off, and publish it. **Yes.**

**Q4.** A loan-approval agent flow must pause and collect a decision and a comment from a compliance officer, then continue. The officer must be able to reply from Outlook. Which action do you add, and what limitation applies?

**Answer:** Add a **Request for information** (Human review) action with a Yes/No input and a Text input. Requests are delivered through Outlook only, cannot go to users outside the tenant, and the **first response wins**; later responses are ignored.

**Q5.** Your HTTP request node calls a partner API that sometimes returns 503. The topic must continue and log the status code instead of stopping. Which two settings do you configure?

**Answer:** In HTTP Request properties set **Error handling** to **Continue on error** and map the **status code** (and optionally the error response body) to topic variables. The default, Raise an error, stops the topic and triggers the On Error system topic. Consider raising the 30-second default **Request timeout** if the API is slow.

**Q6.** A "Benefits" topic contains a generative answers node with Search only selected sources turned on and only the HR SharePoint site selected. The HR site has no answer. What does the node do?

**Answer:** It returns no answer. With Search only selected sources on, the node does **not** fall back to the agent-level knowledge sources, and trigger conditions on the selected source are ignored. Agent-level generative-answers fallback is separate behavior.

**Q7.** Content moderation is set to Highest at the agent level and Low in a topic's generative answers node. Which applies when that node runs?

**Answer:** **Low.** The topic-level (node) setting takes precedence at runtime; the agent-level value applies only where no node-level value is set. The default level is High.

**Q8.** You need to collect a traveler's name and passport number in one form inside a topic and store both in variables. Which node and requirement apply?

**Answer:** Use **Ask with Adaptive Card**. The card must contain at least one `Action.Submit` button; Copilot Studio auto-creates output variables for the input fields (use Edit Schema to correct them). If the agent will run in Teams, keep the card at schema version 1.5. Cards that only display information belong in a Message or Question node.

**Q9.** A flow returns a JSON string to a topic. You need to reference `result.customer.tier` in a Power Fx condition. Which node do you add?

**Answer:** A **Parse value** node with data type From sample data, pasting a sample of the JSON, which yields a typed Record variable with IntelliSense.

**Q10.** You store an API key in a Key Vault secret environment variable. The agent still cannot read it. Which two configurations are missing? (Choose two.)

A. Assign the Key Vault Secrets User role to the Microsoft Copilot Studio Service application
B. Add an `AllowedEnvironments` tag on the secret containing the environment ID
C. Add the HTTP connector to the Business data group
D. Grant the maker Owner on the Key Vault

**Answer: A and B.** (The alternative to B is an `AllowedAgents` tag with `{envId}/{schemaName}`.) The subscription must also have the PowerPlatform resource provider registered.

**Q11.** Which DLP connector must be blocked so makers cannot publish an agent that allows anonymous chat?

**Answer:** **Chat without Microsoft Entra ID authentication in Copilot Studio.** After that, only Authenticate with Microsoft and Authenticate manually (Entra ID options) are selectable, and Require users to sign in cannot be turned off.

**Q12.** An autonomous agent with an email trigger is about to be published. Copilot Studio shows a warning. Why?

**Answer:** Event triggers can only use the **agent author's credentials**, so users of the agent may indirectly reach data and systems through the maker's connections. Triggers require generative orchestration and can be blocked with the Microsoft Copilot Studio DLP connector.

**Q13.** A parent agent has a "Check account balance" child agent and a similar "Get account balance" connector tool. The orchestrator sometimes calls the tool directly. How do you make the tool available only through the child agent's instructions?

**Answer:** On the tool's details page clear **Allow agent to decide dynamically when to use this tool** and reference the tool from the child agent's instructions with `/`.

### Domain 2: Integrate and extend

**Q14.** A support agent must answer "What is the current status of incident INC0012345?" from ServiceNow. Data must not be copied out of ServiceNow, and results must respect each user's ServiceNow permissions. Which knowledge source do you add?

A. ServiceNow Knowledge Copilot connector
B. ServiceNow Power Platform connector as real-time knowledge
C. Azure AI Search index of ServiceNow exports
D. Public website knowledge pointing at the ServiceNow portal

**Answer: B.** Real-time Power Platform knowledge connectors index only metadata, run every query at runtime under the user's tokens, and move no data. A Copilot connector copies content into Microsoft Graph and is best for knowledge-base articles with citations, not live ticket status.

**Q15.** An agent grounded on a Copilot connector works in Teams but returns nothing on the custom website channel. What is the most likely fix?

**Answer:** The manual (Entra ID) authentication configuration is missing the **`ExternalItem.Read.All`** scope. Copilot-connector knowledge needs the agent user's Entra identity; on the website channel that comes from Authenticate manually with the right delegated scopes.

**Q16.** Order the steps to make Azure AI Search available as knowledge with citations.

**Answer:** (1) Create the search service; (2) create a vector index with **Import and vectorize data** (integrated vectorization) and include a URL field such as `metadata_storage_path`; (3) optionally enable the semantic ranker in Azure; (4) in Copilot Studio choose Add knowledge > Featured > Azure AI Search > Create new connection (Access key, client certificate, service principal, or Entra ID integrated); (5) select the single vector index; (6) Add to agent and wait for status Ready; (7) test and check citations. Never configure the endpoint and key manually outside a data connection.

**Q17.** A finance team wants an agent to key invoices into a 15-year-old Windows desktop application that has no API, running unattended overnight. Which tool and which prerequisites?

**Answer:** **Computer use**. Prerequisites: generative orchestration on; a Windows machine registered through Power Automate for desktop **2.61.132.25266 or later** with **Enable for computer use** turned on (or a Cloud PC pool for scale), maker-provided credentials for the autonomous run, stored credentials for the app (internal storage or Key Vault), an access-control allow list, and awareness that each step costs 5 credits (15 for premium models) and is excluded from Microsoft 365 Copilot license inclusion.

**Q18.** Which statement about MCP in Copilot Studio is true?

A. Copilot Studio supports MCP tools, resources, and prompts
B. Both SSE and Streamable HTTP transports are supported
C. MCP access is governed by Power Platform data policies on connectors
D. MCP works with classic orchestration

**Answer: C.** Only tools and resources are supported (A is false), SSE was dropped after August 2025 (B), and generative orchestration is required (D). Resources must be exposed as tool outputs to be usable.

**Q19.** Your MCP server supports OAuth 2.0 dynamic client registration but does not expose a discovery endpoint. Which OAuth type in the onboarding wizard do you choose?

**Answer:** **Dynamic**: provide the authorization URL and token URL, then copy the callback URL into your identity provider app registration. Dynamic discovery is for servers with a discovery endpoint; Manual is for servers that need client ID, secret, and all URLs.

**Q20.** You create a custom connector for an MCP server in Power Apps from an OpenAPI file. Which line must the operation include?

**Answer:** `x-ms-agentic-protocol: mcp-streamable-1.0` on the POST operation (Swagger 2.0 definition).

**Q21.** A partner provides an OpenAPI 3.0 YAML file for their API. What happens when you add it as a REST API tool?

**Answer:** The upload must be a **JSON** file; if it is a v3 specification, Copilot Studio automatically translates it to v2 during creation. You then supply a description, choose a solution, pick None, API key, or OAuth 2.0 authentication, select only the operations users should have, complete every parameter description, publish, and create a connection per tool.

**Q22.** A Copilot Studio main agent has 45 tools and topics and is starting to choose the wrong tool. Reviewing descriptions did not help. What does Microsoft recommend?

**Answer:** Split functionality into **connected agents** (or child agents for logical grouping). Microsoft's rule of thumb is that selection degrades above 30–40 choices. Each child or connected agent has its own orchestration and its own 128-tool limit, at the cost of extra latency and governance surface.

**Q23.** Connecting a Foundry agent works in the designer but the first test message fails with HTTP 400 "endpoint does not support activity." What do you do?

**Answer:** Enable the **Activity protocol** endpoint on the Foundry agent programmatically (REST or Python SDK). New Foundry agents expose only Responses and A2A. The portal will keep showing only Responses and A2A afterward; that is expected.

**Q24.** Which two limitations apply to a Fabric data agent connected to a Copilot Studio agent? (Choose two.)

A. It cannot be redirected to from a topic
B. It cannot be used when the main agent is deployed to Microsoft 365 Copilot
C. It requires the A2A protocol
D. It can update lakehouse tables

**Answer: A and B.** Fabric data agents are read-only and are connected through the native Microsoft Fabric option, not A2A.

**Q25.** When adding an A2A agent, what URL do you enter, and how are the name and description populated?

**Answer:** Enter the agent's **message endpoint URL** (not the agent card URL). If a valid agent card exists at `<endpoint>/.well-known/agent.json`, Copilot Studio pulls the name and description automatically; otherwise enter them manually. Authentication options are None, API key, and OAuth 2.0.

**Q26.** A main agent "Helpdesk" already uses "HR Agent" as a connected agent. Can "Helpdesk" also be added as a connected agent to "Enterprise Assistant"?

**Answer:** **No.** An agent that has connected agents cannot itself be used as a connected agent for another main agent. Agents without connected agents can be connected to many main agents.

**Q27.** You want to compare unique authenticated users per day across channels, excluding test-canvas traffic, in Application Insights. Which query pattern?

**Answer:** Query `customEvents`, extend with `customDimensions['designMode']`, filter `== "False"`, and `summarize dcount(user_Id) by bin(timestamp, 1d)`. The connection string is set under Settings > Advanced.

**Q28.** A prompt tool must use a Llama model deployed in Foundry. The connection fails with "Resource not found." Why?

**Answer:** The endpoint URL must point to the **chat completions** endpoint ending in `/chat/completions`; the Responses API endpoint (`/openai/v1/responses`) is not supported. Deployment name and base model name must match Foundry exactly. GPT-5 family models are not supported for bring your own model.

### Domain 3: Test and manage

**Q29.** Match the evaluation method to the requirement.
1. Confirm a legal disclaimer is reproduced with nearly identical wording.
2. Confirm the agent invoked the "Create ticket" flow.
3. Confirm a product code is returned exactly.
4. Label answers as Compliant or Non-compliant with HR policy.
5. Accept any correctly phrased explanation of the refund policy.

**Answer:** 1 Text similarity (cosine, pass score); 2 Tool use; 3 Exact match; 4 Custom (instructions plus labels mapped to pass/fail); 5 Compare meaning (default pass score 50) or General quality if no expected answer is given.

**Q30.** A tester uploads a CSV with columns "Prompt" and "Answer" containing 150 rows of questions up to 1,500 characters. Which three changes are needed?

**Answer:** Rename headers to **Question** and **Expected response** (in that order), cut to **100** rows, and shorten questions to **1,000** characters or fewer. Save as CSV or TXT.

**Q31.** Two makers run the same test set. Maker B opens Maker A's run but cannot see the agent's responses. Why?

**Answer:** Only the maker who **initiated** a run can view the agent responses and result explanations; others see run status and metrics. Use Compare with on your own runs, and Export for sharing.

**Q32.** After importing a managed solution containing an agent into TEST, users cannot chat with it. Which three steps are commonly required?

**Answer:** Reconfigure **user authentication** (not solution-aware), **publish** the agent, and **share** it (sharing is not solution-aware). Also re-enter Application Insights settings, web-channel security, and channels as needed, and ensure custom connectors were imported before the connection reference.

**Q33. (Yes/No series)** Goal: Deploy the "Sales Agent" solution from DEV to PROD with Power Platform pipelines.
- Solution 1: Run the pipeline from the managed solution in PROD. **No.** Pipelines run from an unmanaged solution in a development environment.
- Solution 2: Make PROD a Managed Environment, link it as a target stage, and deploy from the unmanaged solution in DEV; the pipeline exports and imports a managed artifact. **Yes.**
- Solution 3: Deploy the unmanaged solution to PROD so admins can hot-fix it. **No.** Pipelines deploy managed solutions only.

**Q34.** Your environment variable "Ticket API URL" keeps deploying the DEV value to PROD. What should you do before exporting?

**Answer:** Open the variable in the solution and choose Current Value > **Remove from this solution** so only the definition (and optional default) exports and the import or pipeline prompts for the PROD value.

**Q35.** Which capability requires a Deployment Pipeline Administrator and which allows an approval gate before production?

**Answer:** The **Manage pipelines** button and the Deployment Pipeline Configuration app require the Deployment Pipeline Administrator role; **delegated deployments** (service principal or pipeline owner) support **approvals**, and pipelines can be extended with Power Automate on pre-deployment and post-deployment events.

### Mini case study

**Background.** Contoso Insurance runs Microsoft 365 with Copilot licenses for 40% of staff. Claims data lives in a Fabric lakehouse; policy documents are in SharePoint; the claims system is on-premises with a SOAP API wrapped by an internal REST gateway; adjusters use a legacy Windows app for fraud flags. The agent must run in Teams and Microsoft 365 Copilot, and the company mandates dev, test, and prod environments with approvals.

**C1.** Which knowledge and agent components satisfy the data requirements with least custom code?
**Answer:** SharePoint knowledge (Authenticate with Microsoft gives the Entra identity), a **Fabric data agent** connected agent for lakehouse questions, and a **REST API tool** or custom connector for the gateway. Note that the Fabric data agent will not function in the Microsoft 365 Copilot channel, so plan for Teams 1:1 chats for those questions or accept the limitation.

**C2.** How should fraud flags be set in the legacy app?
**Answer:** A **computer use** tool with maker-provided credentials on a dedicated registered machine or Cloud PC pool, invoked by an autonomous trigger, with an access-control allow list, human supervision, and awareness of per-step credit cost (not covered by Microsoft 365 Copilot licenses).

**C3.** How do you move the solution to production with an approval?
**Answer:** Put the agent, flows, custom connector, connection references, and environment variables in an unmanaged solution in DEV; make TEST and PROD Managed Environments; configure a pipeline in the host with a **delegated deployment** using a service principal and **approvals**; after deployment, reconfigure authentication, channels, Application Insights, and sharing, then publish.

---

## 10. Hands-on lab checklist

Community reviewers agree: build every scenario in the outline at least once. Free options: a Copilot Studio trial, a Microsoft 365 developer tenant, the Microsoft Agent Academy (microsoft.github.io/agent-academy), and the Copilot Agents Labs repository (microsoft.github.io/mcs-labs, which includes MCP, bring-your-own-model, computer use, and human-in-the-loop labs).

- [ ] Create an agent, switch between generative and classic orchestration, and observe the activity map.
- [ ] Configure all three authentication options; note which User.* variables appear; turn on Require users to sign in.
- [ ] Publish to the demo website, Teams, and Microsoft 365 Copilot; submit for admin approval in a dev tenant.
- [ ] Build an agent flow with When an agent calls the flow, Request for information, an approval with Configure run after on timeout, a Scope try/catch, and Respond to the agent; add it as an agent-level tool and inside a topic.
- [ ] In a topic: Send HTTP request with Continue on error, Parse value, Ask with Adaptive Card (JSON then Formula), generative answers node with Search only selected sources, a prompt tool with a Foundry model, and pass variables between topics.
- [ ] Add knowledge: SharePoint, a Copilot connector (ask an admin or use a dev tenant), a real-time Power Platform connector (Dataverse or ServiceNow developer instance), and an Azure AI Search vector index with citations.
- [ ] Connect an MCP server through the wizard (None, API key, and OAuth); toggle Allow all off; try the Dataverse MCP server in a Managed Environment.
- [ ] Add a REST API tool from an OpenAPI v2 JSON; add a custom connector tool and switch it to maker-provided credentials.
- [ ] Configure computer use on a registered machine or hosted browser and run one of Microsoft's sample instruction sets.
- [ ] Build a child agent with inputs and outputs; connect an existing Copilot Studio agent; connect a Foundry agent (enable Activity protocol via SDK); connect a Fabric data agent; connect the Simple-A2A-Sample through Dev Tunnels.
- [ ] Wire Application Insights, run test and real conversations, and query customEvents with and without designMode.
- [ ] Create single-response test sets by every method (quick set, generation, test chat, CSV import, theme), add all seven evaluation methods, run twice, Compare with, Export.
- [ ] Create a solution with a custom publisher, add the agent and required objects, add Text and Secret environment variables, remove current values, export managed, import into a second environment, and reconfigure authentication and channels.
- [ ] Set up a pipelines host, mark a target as a Managed Environment, run a deployment, configure a delegated deployment with a service principal and approval, and add a Power Automate pre-deployment step.
- [ ] Create a DLP policy that blocks anonymous chat and HTTP, then observe the publish error details file.

---

## 11. Four-week study plan

Assumes about 8–10 hours per week and prior Copilot Studio basics. Compress to two weeks if you already build agents daily.

| Week | Focus | Learn content | Hands-on |
| --- | --- | --- | --- |
| 1 | Domain 1: planning, identity, channels, governance, agent flows, topics | Learning path: Design agent conversations and responses using topics (3 modules); Copilot Studio security, DLP, and authentication docs | Labs 1–5 in the checklist |
| 2 | Domain 2 part 1: knowledge and tools | Learning path: Integrate agents with enterprise systems (4 modules); knowledge, MCP, REST API, computer use docs | Labs 6–9 |
| 3 | Domain 2 part 2 and Azure: multi-agent, Foundry, Fabric, A2A, App Insights | Learning path: Design and build multi-agent solutions (4 modules); multi-agent patterns guidance; Foundry A2A docs | Labs 10–11 |
| 4 | Domain 3 plus review | Evaluation docs, ALM guidance, Power Platform pipelines and environment variables docs; Power Platform ALM fundamentals if new to you | Labs 12–14; re-do sample questions; exam sandbox; re-read the official study guide change log |

Daily habit: write one scenario question for each documented limitation you meet ("what breaks if...") and answer it the next day.

---

## 12. Official and community resources

### Microsoft (authoritative)

- Certification page: <https://learn.microsoft.com/credentials/certifications/ai-agent-builder-associate/>
- Study guide: <https://learn.microsoft.com/credentials/certifications/resources/study-guides/ab-620> (short link <https://aka.ms/AB620-StudyGuide>)
- Course AB-620T00-A (3 days ILT; self-paced free): <https://learn.microsoft.com/training/courses/ab-620t00>
- Learning path 1, Design agent conversations and responses using topics in Microsoft Copilot Studio: <https://learn.microsoft.com/training/paths/design-agent-conversations-responses-topics-copilot-studio/>
  - Deliver rich agent responses using Adaptive Cards
  - Take action from agent conversations using topics and tools
  - Generate AI-powered agent responses using generative answers (includes custom prompts with Foundry model selection)
- Learning path 2, Design and build multi-agent solutions in Microsoft Copilot Studio: <https://learn.microsoft.com/training/paths/design-build-multi-agent-solutions-copilot-studio/>
  - Design multi-agent solutions
  - Delegate agent tasks using child agents
  - Build multi-agent solutions using connected agents (Copilot Studio, Foundry, Fabric)
  - Build cross-platform multi-agent solutions using the Agent2Agent protocol
- Learning path 3, Integrate agents with enterprise systems in Microsoft Copilot Studio: <https://learn.microsoft.com/training/paths/integrate-agents-enterprise-systems-copilot-studio/>
  - Design integration strategies for agents
  - Take action in external systems using connector and REST API agent tools
  - Ground agents with enterprise knowledge using connectors and Azure AI Search
  - Integrate agents with external systems via MCP
- Exam sandbox: <https://aka.ms/examdemo>
- Exam duration and experience (question types, breaks, Learn access): <https://learn.microsoft.com/credentials/support/exam-duration-exam-experience>
- Announcement (April 21, 2026): <https://techcommunity.microsoft.com/blog/skills-hub-blog/new-microsoft-certified-ai-agent-builder-associate-certification/4494125>
- Copilot Studio docs: <https://learn.microsoft.com/microsoft-copilot-studio/>
- Power Platform ALM docs: <https://learn.microsoft.com/power-platform/alm/>
- Microsoft Foundry docs: <https://learn.microsoft.com/azure/foundry/>
- Microsoft Agent Academy (free): <https://microsoft.github.io/agent-academy/>
- Copilot Agents Labs (free): <https://microsoft.github.io/mcs-labs/>
- Copilot Studio samples (A2A, MCP): <https://github.com/microsoft/CopilotStudioSamples>
- Copilot Studio agent usage estimator: <https://microsoft.github.io/copilot-studio-estimator/>

### Community (exam experience; verify facts against Microsoft)

- Vlad Talks Tech, "AB-620 Exam: What to Expect & Study Tips": <https://vladtalkstech.com/microsoft-learning-and-credential-news/ab-620-exam-experience/>
- Forward Forever, "Certification Exam Review and Guide: AB-620" (July 16, 2026): <https://forwardforever.com/certification-exam-review-and-guide-ab-620/>
- The Data Community exam prep hub (YouTube playlists and free practice exams): <https://thedatacommunity.org/2026/07/07/exam-prep-hub-for-ab-620-designing-and-building-integrated-ai-agent-solutions-in-copilot-studio/>
- Frank's World study guide (August 4, 2026): <https://www.franksworld.com/2026/08/04/navigating-the-microsoft-ai-agent-builder-associate-ab-620-certification-exam-a-comprehensive-study-guide/>
- MSFT Hub AB-620 materials and labs: <https://msfthub.com/aibusiness/ab-620/>

Avoid "exam dumps." They violate Microsoft's candidate agreement, can void your certification, and are frequently wrong for a new exam.

---

## 13. Exam-day strategy

1. Run the exam sandbox once so the UI, review screen, and mark-for-review flow are familiar.
2. Read the opening screens: they say whether labs and case studies are present.
3. Budget about two minutes per question; case studies deserve more, so bank time on the short ones.
4. In yes/no problem-solution sets, evaluate each proposed solution against documented requirements (trigger names, transport, authentication option, solution type). Do not assume exactly one is correct.
5. When a scenario says "no data movement," "must respect source permissions," "no API," "different teams," "cross-tenant," or "must approve before production," map it to the pattern tables in sections 5.1, 6.1, and 7.2.
6. Use Microsoft Learn in the exam only for a specific fact (a connector name, a limit, a scope). Searching costs time you do not have.
7. Take breaks only after answering and reviewing everything you have seen so far; you cannot go back.
8. Answer every question. There is no penalty for guessing.

---

## 14. Glossary

- **A2A (Agent2Agent) protocol**: open standard for agent-to-agent task delegation with agent cards, context IDs, and multi-turn tasks.
- **Activity protocol**: the Bot Framework-style messaging protocol used by Microsoft 365 Agents SDK agents and required on Foundry agents for Copilot Studio connections.
- **Agent flow**: deterministic automation authored and billed in Copilot Studio; formerly Power Automate cloud flow semantics.
- **Child agent**: lightweight agent inside a main agent sharing its settings and context.
- **Connected agent**: a separately published agent (Copilot Studio, Foundry, Fabric, Agents SDK, A2A) delegated to by a main agent.
- **Copilot connector**: formerly Microsoft Graph connector; indexes external content into Microsoft Graph.
- **Copilot Credits**: billing unit for standard-harness agents.
- **Computer use / CUA**: vision-based model that operates a Windows UI.
- **Generative orchestration**: AI-driven selection of topics, tools, agents, and knowledge by description.
- **Generative answers node**: topic node that searches selected knowledge and summarizes an answer.
- **Harness**: Copilot Studio runtime (standard, GitHub Copilot, Copilot chat).
- **Managed Environment**: Power Platform environment with premium governance; required for pipeline targets.
- **MCP (Model Context Protocol)**: open protocol exposing tools and resources to language-model applications; Copilot Studio supports the Streamable transport.
- **Pipelines host**: the production-type environment that stores pipeline configuration and deployment artifacts.
- **Real-time knowledge connector**: Power Platform connector used as knowledge without data replication.
- **Solution**: Dataverse container for transporting components; unmanaged in dev, managed elsewhere.
- **Tenant graph grounding**: semantic-index retrieval over Microsoft Graph, billed at 10 credits per message for users without Microsoft 365 Copilot licenses.
- **Test set**: up to 100 evaluation cases run against an agent with one or more methods.

---

## 15. Sources

All Microsoft pages were retrieved on September 15, 2026.

**Certification and exam**
- Study guide for Exam AB-620: <https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-620>
- Microsoft Certified: AI Agent Builder Associate: <https://learn.microsoft.com/en-us/credentials/certifications/ai-agent-builder-associate/>
- Course AB-620T00-A: <https://learn.microsoft.com/en-us/training/courses/ab-620t00>
- Learning paths: <https://learn.microsoft.com/en-us/training/paths/design-agent-conversations-responses-topics-copilot-studio/>, <https://learn.microsoft.com/en-us/training/paths/design-build-multi-agent-solutions-copilot-studio/>, <https://learn.microsoft.com/en-us/training/paths/integrate-agents-enterprise-systems-copilot-studio/>
- Exam duration and exam experience: <https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience>
- New Microsoft Certified: AI Agent Builder Associate Certification (Skills Hub blog, April 21, 2026): <https://techcommunity.microsoft.com/blog/skills-hub-blog/new-microsoft-certified-ai-agent-builder-associate-certification/4494125>

**Copilot Studio documentation**
- Harnesses overview: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview>
- Configure user authentication: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication>
- Configure user authentication for tools: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-enduser-authentication>
- Publish and deploy (channels): <https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels>
- Teams and Microsoft 365 Copilot channel: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams>
- Security and governance: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance>
- Configure data policies for agents: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention>
- Share agents: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-share-bots>
- Apply responsible AI principles: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/responsible-ai>
- Agent flows overview: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview>
- Add an agent flow as a tool: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/flow-agent>
- Request information from human review: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-request-for-information>
- Add tools to custom agents: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-tools-custom-agent>
- Use connectors in agents: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-connectors>
- Prompts: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-prompt-node>
- Bring your own model for prompts: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/bring-your-own-model-prompts>
- Generative answers node: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-boost-node>
- Azure OpenAI on your data for generative answers: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-generative-answers-azure-openai>
- Make HTTP requests: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-http-node>
- Adaptive Cards overview: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/adaptive-cards-overview>
- Ask with Adaptive Cards: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-ask-with-adaptive-card>
- Work with variables: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables>
- Manage topic inputs and outputs: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-managing-topic-inputs-outputs>
- Orchestrate agent behavior with generative AI: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions>
- Knowledge sources summary: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio>
- Add Copilot connectors as knowledge: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-connectors>
- Add Power Platform connectors as knowledge: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-real-time-connectors>
- Copilot connectors versus Power Platform connectors: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-graph-vs-power-platform-connectors>
- Add Azure AI Search as knowledge: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-azure-ai-search>
- Computer use: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/computer-use>
- Configure where computer use runs: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-where-computer-use-runs>
- Extend your agent with MCP: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp>
- Connect to an existing MCP server: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-existing-server-to-agent>
- Add MCP tools and resources to an agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-add-components-to-agent>
- Dataverse MCP server reference: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-dataverse>
- Extend your agent with REST API tools: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-rest-api>
- Add other agents overview: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-add-other-agents>
- Add a child agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-child-agent>
- Connect to an existing Copilot Studio agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-copilot-studio-agent>
- Connect to a Microsoft Foundry agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-foundry-agent>
- Connect to a Fabric Data agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-fabric-data-agent>
- Connect over A2A: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-agent-to-agent>
- Connect to a Microsoft 365 Agents SDK agent: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/add-agent-microsoft-365-agents-sdk-agent>
- Multi-agent orchestration patterns: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/multi-agent-patterns>
- Add an event trigger: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-trigger-event>
- Agent-level telemetry with Application Insights: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-bot-framework-composer-capture-telemetry>
- Create a single response test set: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-create>
- Choose evaluation methods: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-overview>
- Run evaluations and view results: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-results>
- Monitor conversational agents: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-improve-agent-effectiveness>
- Export and import agents using solutions: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-solutions-import-export>
- Establish an ALM strategy: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/alm>
- Billing rates and management: <https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management>

**Power Platform, Foundry, Fabric**
- Environment variables: <https://learn.microsoft.com/en-us/power-apps/maker/data-platform/environmentvariables>
- Overview of pipelines in Power Platform: <https://learn.microsoft.com/en-us/power-platform/alm/pipelines>
- Enable incoming A2A on a Foundry agent: <https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/enable-agent-to-agent-endpoint>
- Fabric data agent concepts: <https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent>

**Community**
- Vlad Talks Tech: <https://vladtalkstech.com/microsoft-learning-and-credential-news/ab-620-exam-experience/>
- Forward Forever: <https://forwardforever.com/certification-exam-review-and-guide-ab-620/>
- The Data Community: <https://thedatacommunity.org/2026/07/07/exam-prep-hub-for-ab-620-designing-and-building-integrated-ai-agent-solutions-in-copilot-studio/>
- Frank's World: <https://www.franksworld.com/2026/08/04/navigating-the-microsoft-ai-agent-builder-associate-ab-620-certification-exam-a-comprehensive-study-guide/>
- MSFT Hub: <https://msfthub.com/aibusiness/ab-620/>
- MSCertQuiz AB-620 guide: <https://mscertquiz.com/blog/ab-620-study-guide>
- CertCrush AB-620 explainer: <https://www.certcrush.app/blog/microsoft-ab-620-ai-agent-builder-associate-explained>
