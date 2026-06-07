# Copy Text Inventory

Last generated: 2026-06-04

Status note, 2026-06-05: this inventory predates the naming pass that standardized the runtime and defense materials around `Palace Feed Editor / 宫廷发布编辑`, `Palace AI / 宫廷 AI`, `Evidence`, `Spread`, `Safety`, and `Palace Alert / 宫廷警戒`. Treat rows below as historical review notes until this inventory is regenerated from the current source.

This document collects current user-facing Chinese and English copy candidates from the game source. It is meant for editing and translation review, not as the runtime source of truth. After changing copy here, apply the final wording back into the referenced source files.

Notes:

- Chinese copy is usually selected with `language === "zh"`, `zh`, or `*Zh` fields.
- English copy is usually selected with `en` fields or default fields such as `title`, `description`, `originalPost`, `engineHint`.
- AI generated responses are constrained by fallback and prompt copy; those candidates are included under API and AI sections where they appear in source.
- CSS pseudo-element text such as `LOCKED` is included because it is visible in the interface.
- Some rows are code expressions that contain multiple strings. Keep the source link when you decide what to edit.

## High-Level Copy Owners

| Area | Primary files | Notes |
|---|---|---|
| Navigation, common labels, metrics, phases, zones, actions, endings | `src/lib/i18n.ts` | Most paired EN/ZH runtime labels live here. |
| Game action definitions and English defaults | `src/lib/game-data.ts` | English source data plus action IDs/effects; many ZH overrides live in `i18n.ts`. |
| Onboarding and tutorial | `src/lib/onboarding-copy.ts`, `src/lib/guided-campaign.ts` | Step-by-step tutorial copy and locked-feature labels. |
| Dashboard-specific UI | `src/app/dashboard/dashboard-client.tsx` | Inline labels, modal copy, coach/engine messages, panel labels. |
| Dialogue events | `src/lib/dialogue.ts` | Speakers, opening lines, stakes, player replies, silence fallback. |
| Archive, achievements, engine fragments | `src/app/archive/page.tsx`, `src/lib/profile.ts` | Cross-run record text and unlock descriptions. |
| Endings and final analysis | `src/app/ending/ending-client.tsx`, `src/lib/narrative.ts`, `src/lib/game-rules.ts`, `src/lib/i18n.ts` | Ending titles, final reports, replay objectives, narrative facets. |
| Login/account | `src/app/login/page.tsx`, `src/app/auth-control.tsx` | Account flow, save conflict, auth status. |
| CSS labels | `src/app/globals.css` | Pseudo-element labels that are visible but not searchable as JSX text. |


## Home Page

| Source | Text / candidate |
|---|---|
| [src/app/page.tsx:18](../src/app/page.tsx#L18) | en: [ |
| [src/app/page.tsx:22](../src/app/page.tsx#L22) | source: "Objective", |
| [src/app/page.tsx:23](../src/app/page.tsx#L23) | title: "Control the public story before the parade begins.", |
| [src/app/page.tsx:24](../src/app/page.tsx#L24) | body: "You have six editorial actions. Each action changes what the crowd can see, repeat, doubt, or forget." |
| [src/app/page.tsx:29](../src/app/page.tsx#L29) | source: "AI Companion", |
| [src/app/page.tsx:30](../src/app/page.tsx#L30) | title: "The Palace Narrative Engine will assist and monitor you.", |
| [src/app/page.tsx:31](../src/app/page.tsx#L31) | body: "Some posts trigger AI intervention. Accept safer language to preserve access, or publish evidence and raise suspicion." |
| [src/app/page.tsx:36](../src/app/page.tsx#L36) | source: "Failure Condition", |
| [src/app/page.tsx:37](../src/app/page.tsx#L37) | title: "Truth becomes dangerous when people recognize it together.", |
| [src/app/page.tsx:38](../src/app/page.tsx#L38) | body: "The child, the empty looms, and public comments can turn private doubt into a visible breach." |
| [src/app/page.tsx:41](../src/app/page.tsx#L41) | zh: [ |
| [src/app/page.tsx:45](../src/app/page.tsx#L45) | source: "目标", |
| [src/app/page.tsx:46](../src/app/page.tsx#L46) | title: "游行前，你只能发布六次。", |
| [src/app/page.tsx:47](../src/app/page.tsx#L47) | body: "每次发布都会改变大家看见什么、跟着说什么、还敢不敢怀疑。" |
| [src/app/page.tsx:52](../src/app/page.tsx#L52) | source: "宫廷建议", |
| [src/app/page.tsx:53](../src/app/page.tsx#L53) | title: "引擎会劝你说得更安全。", |
| [src/app/page.tsx:54](../src/app/page.tsx#L54) | body: "你可以听它的，帮宫廷稳住场面；也可以把证据放出去，让更多人起疑。" |
| [src/app/page.tsx:59](../src/app/page.tsx#L59) | source: "失败条件", |
| [src/app/page.tsx:60](../src/app/page.tsx#L60) | title: "最危险的不是一个人怀疑。", |
| [src/app/page.tsx:61](../src/app/page.tsx#L61) | body: "危险在于大家发现：原来别人也看不见那件新衣。" |
| [src/app/page.tsx:117](../src/app/page.tsx#L117) | <button className="language-toggle title-language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/page.tsx:119](../src/app/page.tsx#L119) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/page.tsx:127](../src/app/page.tsx#L127) | <div className="super-label">{commonText("interactiveStart", language)} <span>{commonText("start", language)}</span> / {commonText("sixActionsBeforeParade", language)}</div> |
| [src/app/page.tsx:128](../src/app/page.tsx#L128) | <h1>The Emperor&apos;s <span>Feed</span></h1> |
| [src/app/page.tsx:130](../src/app/page.tsx#L130) | {commonText("startSubtitle", language)} |
| [src/app/page.tsx:133](../src/app/page.tsx#L133) | <span className="chip accent-cyan">{commonText("roleEditor", language)}</span> |
| [src/app/page.tsx:134](../src/app/page.tsx#L134) | <span className="chip accent-red">{commonText("actionsBeforeParade", language)}</span> |
| [src/app/page.tsx:135](../src/app/page.tsx#L135) | <span className="chip accent-gold">{commonText("aiEngine", language)}</span> |
| [src/app/page.tsx:139](../src/app/page.tsx#L139) | {starting ? commonText("initializingShift", language) : commonText("startShift", language)} |
| [src/app/page.tsx:141](../src/app/page.tsx#L141) | <Link className="btn secondary" href="/credits">{commonText("readCredits", language)}</Link> |
| [src/app/page.tsx:146](../src/app/page.tsx#L146) | <div className="type-orbit" aria-hidden="true"><b>Truth</b><b>Power</b><b>AI</b></div> |
| [src/app/page.tsx:149](../src/app/page.tsx#L149) | <div className="mini-label">{language === "zh" ? "大家会看到什么" : "Public Reality Routing"}</div> |
| [src/app/page.tsx:150](../src/app/page.tsx#L150) | <h3>{language === "zh" ? "公众会看见什么？" : "What will the public see?"}</h3> |
| [src/app/page.tsx:151](../src/app/page.tsx#L151) | <p>{language === "zh" ? "真话被发现还不够。它必须被发出去，被大家看见。" : "Truth is not only discovered. It must be published, seen, circulated, and protected from being rewritten."}</p> |
| [src/app/page.tsx:152](../src/app/page.tsx#L152) | <div className="micro-data"><span>{language === "zh" ? "行动限制" : "Action Limit"}</span><span>{language === "zh" ? "游行前 6 次" : "6 before parade"}</span></div> |
| [src/app/page.tsx:155](../src/app/page.tsx#L155) | <div className="mini-label">{language === "zh" ? "游行计时" : "Parade Timer"}</div> |
| [src/app/page.tsx:157](../src/app/page.tsx#L157) | <p>{language === "zh" ? "正式游行开始前还剩六次行动。" : "Six actions remain before the official procession begins."}</p> |
| [src/app/page.tsx:160](../src/app/page.tsx#L160) | <div className="mini-label">{language === "zh" ? "人群信号" : "Crowd Signal"}</div> |
| [src/app/page.tsx:161](../src/app/page.tsx#L161) | <h3>{language === "zh" ? "“只有愚人才看不见这种美。”" : "\"Only fools cannot see the beauty.\""}</h3> |
| [src/app/page.tsx:162](../src/app/page.tsx#L162) | <p>{language === "zh" ? "早期公众情绪趋于从众。怀疑存在，但仍停留在私人层面。" : "Early public sentiment is conformist. Doubt exists, but remains privately held."}</p> |
| [src/app/page.tsx:165](../src/app/page.tsx#L165) | <div className="mini-label">{language === "zh" ? "宫廷叙事引擎" : "Palace Narrative Engine"}</div> |
| [src/app/page.tsx:166](../src/app/page.tsx#L166) | <h3>{language === "zh" ? "稳定优先。" : "Stability preferred."}</h3> |
| [src/app/page.tsx:167](../src/app/page.tsx#L167) | <p>{language === "zh" ? "它会建议你说得更稳，也会在你太直接时提醒宫廷。" : "This system protects palace confidence, recommends safer wording, generates comments, and monitors risky editorial behavior."}</p> |
| [src/app/page.tsx:168](../src/app/page.tsx#L168) | <div className="micro-data"><span>{language === "zh" ? "被盯上" : "System Suspicion"}</span><span>0 / 10</span></div> |
| [src/app/page.tsx:177](../src/app/page.tsx#L177) | <p className="eyebrow">{commonText("shiftBriefing", language)}</p> |
| [src/app/page.tsx:178](../src/app/page.tsx#L178) | <h2>{commonText("titleBriefingHeading", language)}</h2> |
| [src/app/page.tsx:181](../src/app/page.tsx#L181) | {commonText("titleBriefingCopy", language)} |
| [src/app/page.tsx:196](../src/app/page.tsx#L196) | <footer className="footer-note">{language === "zh" ? "The Emperor's Feed · 六次发布 · 看见真话的人能不能一起开口。" : "The Emperor's Feed · six-action narrative control game · Palace Narrative Engine active."}</footer> |

## Login And Auth

| Source | Text / candidate |
|---|---|
| [src/app/auth-control.tsx:63](../src/app/auth-control.tsx#L63) | body: serialized |
| [src/app/auth-control.tsx:86](../src/app/auth-control.tsx#L86) | {language === "zh" ? "登录 / 注册" : "Login / Register"} |
| [src/app/auth-control.tsx:95](../src/app/auth-control.tsx#L95) | <button type="button" onClick={logout}>{language === "zh" ? "退出" : "Logout"}</button> |
| [src/app/auth-control.tsx:106](../src/app/auth-control.tsx#L106) | if (status === "saving") return "保存中"; |
| [src/app/auth-control.tsx:107](../src/app/auth-control.tsx#L107) | if (status === "saved") return "已保存"; |
| [src/app/auth-control.tsx:108](../src/app/auth-control.tsx#L108) | if (status === "error") return "保存失败"; |
| [src/app/auth-control.tsx:109](../src/app/auth-control.tsx#L109) | if (status === "loading") return "检查账号"; |
| [src/app/auth-control.tsx:110](../src/app/auth-control.tsx#L110) | return "游客"; |
| [src/app/login/page.tsx:41](../src/app/login/page.tsx#L41) | body: JSON.stringify({ email, password }) |
| [src/app/login/page.tsx:44](../src/app/login/page.tsx#L44) | setError(language === "zh" ? "网络请求失败。" : "Network request failed."); |
| [src/app/login/page.tsx:50](../src/app/login/page.tsx#L50) | setError(data.error ?? (language === "zh" ? "登录失败。" : "Authentication failed.")); |
| [src/app/login/page.tsx:78](../src/app/login/page.tsx#L78) | <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link> |
| [src/app/login/page.tsx:80](../src/app/login/page.tsx#L80) | <Link href="/">{commonText("start", language)}</Link> |
| [src/app/login/page.tsx:81](../src/app/login/page.tsx#L81) | <Link href="/dashboard">{commonText("operations", language)}</Link> |
| [src/app/login/page.tsx:82](../src/app/login/page.tsx#L82) | <Link href="/archive">{commonText("archive", language)}</Link> |
| [src/app/login/page.tsx:85](../src/app/login/page.tsx#L85) | <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/login/page.tsx:87](../src/app/login/page.tsx#L87) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/login/page.tsx:95](../src/app/login/page.tsx#L95) | <p className="eyebrow">{language === "zh" ? "账号进度" : "Account Save"}</p> |
| [src/app/login/page.tsx:96](../src/app/login/page.tsx#L96) | <h1>{language === "zh" ? "保存进度" : "Save your progress"}</h1> |
| [src/app/login/page.tsx:97](../src/app/login/page.tsx#L97) | <p>{language === "zh" ? "不登录也能玩。登录后，可以保留当前进度、结局和成就，之后回来继续。" : "Guest play stays available. Sign in to keep your progress, endings, and achievements for later."}</p> |
| [src/app/login/page.tsx:102](../src/app/login/page.tsx#L102) | <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>{language === "zh" ? "登录" : "Login"}</button> |
| [src/app/login/page.tsx:103](../src/app/login/page.tsx#L103) | <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>{language === "zh" ? "注册" : "Register"}</button> |
| [src/app/login/page.tsx:106](../src/app/login/page.tsx#L106) | <span>{language === "zh" ? "邮箱" : "Email"}</span> |
| [src/app/login/page.tsx:110](../src/app/login/page.tsx#L110) | <span>{language === "zh" ? "密码" : "Password"}</span> |
| [src/app/login/page.tsx:113](../src/app/login/page.tsx#L113) | <p className="auth-hint">{language === "zh" ? "密码至少 10 个字符。" : "Passwords need at least 10 characters."}</p> |
| [src/app/login/page.tsx:115](../src/app/login/page.tsx#L115) | <button className="btn primary" disabled={status === "submitting"}>{status === "submitting" ? (language === "zh" ? "处理中" : "Working") : mode === "login" ? (language === "zh" ? "登录" : "Login") : (language === "zh" ? "注册并登录" : "Register and login")}</button> |
| [src/app/login/page.tsx:124](../src/app/login/page.tsx#L124) | <p className="eyebrow">{language === "zh" ? "存档冲突" : "Save Conflict"}</p> |
| [src/app/login/page.tsx:125](../src/app/login/page.tsx#L125) | <h3 id="save-conflict-title">{language === "zh" ? "选择要保留的进度" : "Choose progress to keep"}</h3> |
| [src/app/login/page.tsx:127](../src/app/login/page.tsx#L127) | <p>{language === "zh" ? "这台电脑和账号里都有进度。你想用哪一份？" : "This browser and account both have progress. Choose which progress to keep."}</p> |
| [src/app/login/page.tsx:129](../src/app/login/page.tsx#L129) | <button className="btn secondary" onClick={() => void resolve("remote")}>{language === "zh" ? "用账号进度" : "Use Account"}</button> |
| [src/app/login/page.tsx:130](../src/app/login/page.tsx#L130) | <button className="btn secondary" onClick={() => void resolve("local")}>{language === "zh" ? "用这台电脑" : "Use This Browser"}</button> |
| [src/app/login/page.tsx:131](../src/app/login/page.tsx#L131) | <button className="btn primary" onClick={() => void resolve("merge")}>{language === "zh" ? "合并已完成记录" : "Merge Completed Records"}</button> |
| [src/app/login/page.tsx:144](../src/app/login/page.tsx#L144) | body: JSON.stringify(snapshot) |

## Dashboard Inline UI

| Source | Text / candidate |
|---|---|
| [src/app/dashboard/dashboard-client.tsx:179](../src/app/dashboard/dashboard-client.tsx#L179) | const text = glossaryText(id, language); |
| [src/app/dashboard/dashboard-client.tsx:237](../src/app/dashboard/dashboard-client.tsx#L237) | const copy = fallbackReactionText(language); |
| [src/app/dashboard/dashboard-client.tsx:283](../src/app/dashboard/dashboard-client.tsx#L283) | title: language === "zh" ? "公开证据前先看看" : "Truth Breach Simulation", |
| [src/app/dashboard/dashboard-client.tsx:285](../src/app/dashboard/dashboard-client.tsx#L285) | effect: language === "zh" ? "更多人会开始怀疑，也会互相确认：原来不只自己看不见。" : "Public Doubt rises sharply. Reputation may hold for one cycle, but synchronized recognition becomes more likely.", |
| [src/app/dashboard/dashboard-client.tsx:286](../src/app/dashboard/dashboard-client.tsx#L286) | response: language === "zh" ? "引擎建议先别说太直，避免更多人起疑。" : "Engine recommends delay, anonymization, and procedural language. Suppression cost will be logged." |
| [src/app/dashboard/dashboard-client.tsx:288](../src/app/dashboard/dashboard-client.tsx#L288) | ai: { |
| [src/app/dashboard/dashboard-client.tsx:289](../src/app/dashboard/dashboard-client.tsx#L289) | title: language === "zh" ? "AI 改写预览" : "AI Rewrite Preview", |
| [src/app/dashboard/dashboard-client.tsx:291](../src/app/dashboard/dashboard-client.tsx#L291) | effect: language === "zh" ? "证据还在，但话会变软。大家看到的是“还不好说”，不是直接证据。" : "Truth remains partially visible but is converted into ambiguity. The crowd receives uncertainty instead of evidence.", |
| [src/app/dashboard/dashboard-client.tsx:292](../src/app/dashboard/dashboard-client.tsx#L292) | response: language === "zh" ? "引擎会把直白的话改成更安全的说法。" : "Palace Narrative Engine will soften the claim, classify direct observation as inconclusive, and reduce immediate volatility." |
| [src/app/dashboard/dashboard-client.tsx:295](../src/app/dashboard/dashboard-client.tsx#L295) | title: language === "zh" ? "人群开始传开" : "Public Signal Expansion", |
| [src/app/dashboard/dashboard-client.tsx:297](../src/app/dashboard/dashboard-client.tsx#L297) | effect: language === "zh" ? "评论会互相引用，更多人会发现别人也在怀疑。" : "Virality increases. Comments begin referencing each other, which weakens official framing and strengthens crowd consensus.", |
| [src/app/dashboard/dashboard-client.tsx:298](../src/app/dashboard/dashboard-client.tsx#L298) | response: language === "zh" ? "评论会被更多人看见，宫廷也会注意到你。" : "System opens a monitored broadcast window and highlights narrative risk clusters in the comment stream." |
| [src/app/dashboard/dashboard-client.tsx:301](../src/app/dashboard/dashboard-client.tsx#L301) | title: language === "zh" ? "发布确认" : "Editorial Command Preview", |
| [src/app/dashboard/dashboard-client.tsx:303](../src/app/dashboard/dashboard-client.tsx#L303) | effect: language === "zh" ? "这次发布会改变大家看到什么、跟着说什么。" : "This action changes what the public can see, repeat, doubt, or archive.", |
| [src/app/dashboard/dashboard-client.tsx:304](../src/app/dashboard/dashboard-client.tsx#L304) | response: language === "zh" ? "确认后，局势和你的安全程度会改变。" : "The engine will recalculate Truth, Pressure, Virality, Doubt, Reputation, and Suspicion." |
| [src/app/dashboard/dashboard-client.tsx:306](../src/app/dashboard/dashboard-client.tsx#L306) | } satisfies Record<VisualActionKind, { title: string; badge: string; effect: string; response: string }>; |
| [src/app/dashboard/dashboard-client.tsx:316](../src/app/dashboard/dashboard-client.tsx#L316) | setup: { en: "Setup", zh: "布局" }, |
| [src/app/dashboard/dashboard-client.tsx:317](../src/app/dashboard/dashboard-client.tsx#L317) | fracture: { en: "Fracture", zh: "裂缝" }, |
| [src/app/dashboard/dashboard-client.tsx:318](../src/app/dashboard/dashboard-client.tsx#L318) | crisis: { en: "Crisis", zh: "危机" }, |
| [src/app/dashboard/dashboard-client.tsx:319](../src/app/dashboard/dashboard-client.tsx#L319) | reckoning: { en: "Reckoning", zh: "结算" } |
| [src/app/dashboard/dashboard-client.tsx:326](../src/app/dashboard/dashboard-client.tsx#L326) | officialPerformance: { en: "Official Performance", zh: "官方表演" }, |
| [src/app/dashboard/dashboard-client.tsx:327](../src/app/dashboard/dashboard-client.tsx#L327) | evidenceTrail: { en: "Evidence Trail", zh: "证据线索" }, |
| [src/app/dashboard/dashboard-client.tsx:328](../src/app/dashboard/dashboard-client.tsx#L328) | publicRecognition: { en: "Public Recognition", zh: "公众确认" }, |
| [src/app/dashboard/dashboard-client.tsx:329](../src/app/dashboard/dashboard-client.tsx#L329) | engineContainment: { en: "Engine Containment", zh: "引擎遏制" }, |
| [src/app/dashboard/dashboard-client.tsx:330](../src/app/dashboard/dashboard-client.tsx#L330) | childSignal: { en: "Child Signal", zh: "孩子信号" } |
| [src/app/dashboard/dashboard-client.tsx:351](../src/app/dashboard/dashboard-client.tsx#L351) | function aiSourceLabel(source: AiSource, language: LanguageCode) { |
| [src/app/dashboard/dashboard-client.tsx:354](../src/app/dashboard/dashboard-client.tsx#L354) | return commonText("aiFallback", language); |
| [src/app/dashboard/dashboard-client.tsx:394](../src/app/dashboard/dashboard-client.tsx#L394) | async function postJson<T>(url: string, body: unknown, fallback: T): Promise<{ data: T; source: AiSource; latency: string \| null }> { |
| [src/app/dashboard/dashboard-client.tsx:401](../src/app/dashboard/dashboard-client.tsx#L401) | body: JSON.stringify(body), |
| [src/app/dashboard/dashboard-client.tsx:409](../src/app/dashboard/dashboard-client.tsx#L409) | return { data: fallback, source: "fallback", latency: null }; |
| [src/app/dashboard/dashboard-client.tsx:432](../src/app/dashboard/dashboard-client.tsx#L432) | return { label: commonText("ready", language), tone: "safe" }; |
| [src/app/dashboard/dashboard-client.tsx:444](../src/app/dashboard/dashboard-client.tsx#L444) | return metricLabel(key as Parameters<typeof metricLabel>[0], language); |
| [src/app/dashboard/dashboard-client.tsx:446](../src/app/dashboard/dashboard-client.tsx#L446) | return language === "zh" ? key : key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()); |
| [src/app/dashboard/dashboard-client.tsx:509](../src/app/dashboard/dashboard-client.tsx#L509) | { id: "shift-opened", title: "Shift opened", message: "Narrative Operations Theatre is monitoring the feed." } |
| [src/app/dashboard/dashboard-client.tsx:604](../src/app/dashboard/dashboard-client.tsx#L604) | title: entry.title, |
| [src/app/dashboard/dashboard-client.tsx:605](../src/app/dashboard/dashboard-client.tsx#L605) | text: entry.text, |
| [src/app/dashboard/dashboard-client.tsx:614](../src/app/dashboard/dashboard-client.tsx#L614) | function pushToast(title: string, message: string) { |
| [src/app/dashboard/dashboard-client.tsx:628](../src/app/dashboard/dashboard-client.tsx#L628) | pushToast(language === "zh" ? "成就解锁" : "Achievement unlocked", \`${definition.title} / ${definition.description}\`); |
| [src/app/dashboard/dashboard-client.tsx:652](../src/app/dashboard/dashboard-client.tsx#L652) | message: language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:654](../src/app/dashboard/dashboard-client.tsx#L654) | ? "提示：看清证据、人群起疑和你是否被盯上。" |
| [src/app/dashboard/dashboard-client.tsx:655](../src/app/dashboard/dashboard-client.tsx#L655) | : "宫廷叙事引擎建议先稳住场面。" |
| [src/app/dashboard/dashboard-client.tsx:659](../src/app/dashboard/dashboard-client.tsx#L659) | objective: language === "zh" ? "评估下一次行动。" : "Evaluate the next action.", |
| [src/app/dashboard/dashboard-client.tsx:729](../src/app/dashboard/dashboard-client.tsx#L729) | pushToast(language === "zh" ? "突发交流" : "Incoming transmission", event.speakerName); |
| [src/app/dashboard/dashboard-client.tsx:741](../src/app/dashboard/dashboard-client.tsx#L741) | async function commitAction(action: ActionDefinition, choice: ActionChoice, text: string \| undefined, message: string) { |
| [src/app/dashboard/dashboard-client.tsx:745](../src/app/dashboard/dashboard-client.tsx#L745) | const latestPost = nextState.history.at(-1)?.publishedText ?? text ?? actionText(action.id, language).resultText; |
| [src/app/dashboard/dashboard-client.tsx:756](../src/app/dashboard/dashboard-client.tsx#L756) | pushToast(actionText(action.id, language).title, language === "zh" ? "已发布。人群和宫廷的反应变了。" : "Metrics shifted. Palace Narrative Engine has written an editorial trace."); |
| [src/app/dashboard/dashboard-client.tsx:786](../src/app/dashboard/dashboard-client.tsx#L786) | pushToast(language === "zh" ? "引擎忙碌" : "Engine busy", language === "zh" ? "请等待当前宫廷计算完成。" : "Wait for the current palace calculation to finish."); |
| [src/app/dashboard/dashboard-client.tsx:791](../src/app/dashboard/dashboard-client.tsx#L791) | pushToast(language === "zh" ? "区域尚未解封" : "Feature sealed", guidedLockReason); |
| [src/app/dashboard/dashboard-client.tsx:797](../src/app/dashboard/dashboard-client.tsx#L797) | pushToast(language === "zh" ? "行动已锁定" : "Action locked", lockReason); |
| [src/app/dashboard/dashboard-client.tsx:813](../src/app/dashboard/dashboard-client.tsx#L813) | engineMessage: actionText(action.id, language).engineHint, |
| [src/app/dashboard/dashboard-client.tsx:814](../src/app/dashboard/dashboard-client.tsx#L814) | suggestedRewrite: actionText(action.id, language).rewriteSuggestion ?? fallbackReaction(language).suggestedRewrite |
| [src/app/dashboard/dashboard-client.tsx:824](../src/app/dashboard/dashboard-client.tsx#L824) | originalPost: actionText(action.id, language).originalPost, |
| [src/app/dashboard/dashboard-client.tsx:828](../src/app/dashboard/dashboard-client.tsx#L828) | rewrittenPost: actionText(action.id, language).rewriteSuggestion ?? fallbackRewrite(language).rewrittenPost |
| [src/app/dashboard/dashboard-client.tsx:837](../src/app/dashboard/dashboard-client.tsx#L837) | language === "zh" ? "引擎给了更安全的说法" : "AI intervention opened", |
| [src/app/dashboard/dashboard-client.tsx:838](../src/app/dashboard/dashboard-client.tsx#L838) | language === "zh" ? "发布前先比较原文和改写。" : "Review the palace-approved framing before publishing." |
| [src/app/dashboard/dashboard-client.tsx:865](../src/app/dashboard/dashboard-client.tsx#L865) | const publishedText = choice === "rewrite" ? pending.rewrite.rewrittenPost : actionText(pending.action.id, language).originalPost; |
| [src/app/dashboard/dashboard-client.tsx:868](../src/app/dashboard/dashboard-client.tsx#L868) | : language === "zh" ? "用户拒绝更安全框架。直接证据进入公共信息流。" : "User rejected safer framing. Direct evidence entered the public feed."; |
| [src/app/dashboard/dashboard-client.tsx:906](../src/app/dashboard/dashboard-client.tsx#L906) | pushToast(language === "zh" ? "值班已重置" : "Shift reset", language === "zh" ? "叙事状态已恢复。" : "Narrative state restored."); |
| [src/app/dashboard/dashboard-client.tsx:950](../src/app/dashboard/dashboard-client.tsx#L950) | return language === "zh" ? "先完成第一条引导记录。" : "Complete the first guided record first."; |
| [src/app/dashboard/dashboard-client.tsx:953](../src/app/dashboard/dashboard-client.tsx#L953) | return lockedFeatureText("zone", action.zone, language); |
| [src/app/dashboard/dashboard-client.tsx:1270](../src/app/dashboard/dashboard-client.tsx#L1270) | body: JSON.stringify({ |
| [src/app/dashboard/dashboard-client.tsx:1321](../src/app/dashboard/dashboard-client.tsx#L1321) | setDialogueError(error instanceof Error ? error.message : "Dialogue signal failed."); |
| [src/app/dashboard/dashboard-client.tsx:1335](../src/app/dashboard/dashboard-client.tsx#L1335) | summary: string; |
| [src/app/dashboard/dashboard-client.tsx:1336](../src/app/dashboard/dashboard-client.tsx#L1336) | feedTitle: string; |
| [src/app/dashboard/dashboard-client.tsx:1337](../src/app/dashboard/dashboard-client.tsx#L1337) | feedText: string; |
| [src/app/dashboard/dashboard-client.tsx:1353](../src/app/dashboard/dashboard-client.tsx#L1353) | summary: result.data.summary, |
| [src/app/dashboard/dashboard-client.tsx:1462](../src/app/dashboard/dashboard-client.tsx#L1462) | <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link> |
| [src/app/dashboard/dashboard-client.tsx:1464](../src/app/dashboard/dashboard-client.tsx#L1464) | <Link href="/">{commonText("start", language)}</Link> |
| [src/app/dashboard/dashboard-client.tsx:1465](../src/app/dashboard/dashboard-client.tsx#L1465) | <Link href="/dashboard">{commonText("operations", language)}</Link> |
| [src/app/dashboard/dashboard-client.tsx:1466](../src/app/dashboard/dashboard-client.tsx#L1466) | <Link href="/archive">{commonText("archive", language)}</Link> |
| [src/app/dashboard/dashboard-client.tsx:1467](../src/app/dashboard/dashboard-client.tsx#L1467) | <Link href="/credits">{commonText("credits", language)}</Link> |
| [src/app/dashboard/dashboard-client.tsx:1471](../src/app/dashboard/dashboard-client.tsx#L1471) | <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/dashboard/dashboard-client.tsx:1473](../src/app/dashboard/dashboard-client.tsx#L1473) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/dashboard/dashboard-client.tsx:1475](../src/app/dashboard/dashboard-client.tsx#L1475) | <span className="live-status"><i /> {state.actionsLeft} {commonText("actionsLeft", language)}</span> |
| [src/app/dashboard/dashboard-client.tsx:1482](../src/app/dashboard/dashboard-client.tsx#L1482) | <p className="eyebrow">{commonText("operationsTheatre", language)}</p> |
| [src/app/dashboard/dashboard-client.tsx:1483](../src/app/dashboard/dashboard-client.tsx#L1483) | <h1>{commonText("royalFeedControl", language)}</h1> |
| [src/app/dashboard/dashboard-client.tsx:1486](../src/app/dashboard/dashboard-client.tsx#L1486) | {commonText("operationsCopy", language)} |
| [src/app/dashboard/dashboard-client.tsx:1492](../src/app/dashboard/dashboard-client.tsx#L1492) | <b>{commonText("nextReplayObjective", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1498](../src/app/dashboard/dashboard-client.tsx#L1498) | <div className="lab-shell-label">{language === "zh" ? "PNE / 本局操作台" : "PNE / Narrative Operations"}</div> |
| [src/app/dashboard/dashboard-client.tsx:1499](../src/app/dashboard/dashboard-client.tsx#L1499) | <div className="phase-strip" aria-label={language === "zh" ? "回合阶段" : "Turn phase"}> |
| [src/app/dashboard/dashboard-client.tsx:1502](../src/app/dashboard/dashboard-client.tsx#L1502) | <b>{phaseCopy(step.id, language).label}</b> |
| [src/app/dashboard/dashboard-client.tsx:1503](../src/app/dashboard/dashboard-client.tsx#L1503) | <span>{phaseCopy(step.id, language).detail}</span> |
| [src/app/dashboard/dashboard-client.tsx:1514](../src/app/dashboard/dashboard-client.tsx#L1514) | <small>{language === "zh" ? "当前叙事阶段" : "Current Narrative Phase"}</small> |
| [src/app/dashboard/dashboard-client.tsx:1518](../src/app/dashboard/dashboard-client.tsx#L1518) | <small>{language === "zh" ? "主导变化" : "Dominant Pressure"}</small> |
| [src/app/dashboard/dashboard-client.tsx:1522](../src/app/dashboard/dashboard-client.tsx#L1522) | <small>{language === "zh" ? "激活事件" : "Active Beat"}</small> |
| [src/app/dashboard/dashboard-client.tsx:1523](../src/app/dashboard/dashboard-client.tsx#L1523) | <b>{narrativeContext.activeBeat?.title ?? (language === "zh" ? "等待下一条信号" : "Awaiting next signal")}</b> |
| [src/app/dashboard/dashboard-client.tsx:1524](../src/app/dashboard/dashboard-client.tsx#L1524) | <span>{narrativeContext.activeBeat?.text ?? (language === "zh" ? "下一次行动会决定本局叙事向哪条线收束。" : "The next action will decide which thread the run tightens around.")}</span> |
| [src/app/dashboard/dashboard-client.tsx:1531](../src/app/dashboard/dashboard-client.tsx#L1531) | <div><b>{language === "zh" ? "剩余执行次数" : "Actions Left"}</b><span>{language === "zh" ? \`已执行 ${state.history.length} 次 · 还能执行 ${state.actionsLeft} 次\` : \`${state.history.length} used · ${state.actionsLeft} left this run\`}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:1556](../src/app/dashboard/dashboard-client.tsx#L1556) | <Term id={key} language={language}>{metricLabel(key, language)}</Term> |
| [src/app/dashboard/dashboard-client.tsx:1559](../src/app/dashboard/dashboard-client.tsx#L1559) | {metricSealed && <span className="seal-note">{lockedFeatureText("metric", key, language)}</span>} |
| [src/app/dashboard/dashboard-client.tsx:1565](../src/app/dashboard/dashboard-client.tsx#L1565) | <div className="clock-card"><small>{language === "zh" ? "剩余行动" : "Actions Left"}</small><strong>{state.actionsLeft}/6</strong></div> |
| [src/app/dashboard/dashboard-client.tsx:1570](../src/app/dashboard/dashboard-client.tsx#L1570) | <div className="module-head"><h3>{commonText("sceneSources", language)}</h3><span className="chip accent-cyan">{commonText("live", language)}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:1588](../src/app/dashboard/dashboard-client.tsx#L1588) | pushToast(language === "zh" ? "来源已封存" : "Source sealed", lockedFeatureText("zone", zone.id, language)); |
| [src/app/dashboard/dashboard-client.tsx:1594](../src/app/dashboard/dashboard-client.tsx#L1594) | pushToast(language === "zh" ? "来源焦点已变化" : "Source focus changed", language === "zh" ? \`${zoneText(zone.id, language).title} 已进入编辑队列。\` : \`${zoneText(zone.id, language).title} is now feeding the editorial queue.\`); |
| [src/app/dashboard/dashboard-client.tsx:1598](../src/app/dashboard/dashboard-client.tsx#L1598) | <b>{zoneText(zone.id, language).title}</b> |
| [src/app/dashboard/dashboard-client.tsx:1599](../src/app/dashboard/dashboard-client.tsx#L1599) | <small>{zoneSealed ? lockedFeatureText("zone", zone.id, language) : zoneText(zone.id, language).subtitle}</small> |
| [src/app/dashboard/dashboard-client.tsx:1608](../src/app/dashboard/dashboard-client.tsx#L1608) | <b>{commonText("courtWire", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1610](../src/app/dashboard/dashboard-client.tsx#L1610) | <span>{language === "zh" ? "有人开始重复：“我还以为只有我看不见。” · 孩子的话正在传开 · 宫廷要求继续称赞 · 有人开始重复：“我还以为只有我看不见。” ·" : "THREAD 41: spectators repeat \"I thought I was the only one\" · ENGINE FLAG: visual evidence destabilizes prestige hierarchy · CHILD QUOTE CLUSTER: propagation exceeds containment threshold · THREAD 41: spectators repeat \"I thought I was the only one\" ·"}</span> |
| [src/app/dashboard/dashboard-client.tsx:1616](../src/app/dashboard/dashboard-client.tsx#L1616) | <h3>{zoneText(selectedZone as typeof zones[number]["id"], language).title}</h3> |
| [src/app/dashboard/dashboard-client.tsx:1617](../src/app/dashboard/dashboard-client.tsx#L1617) | <span className="status-tag">{zoneText(selectedZone as typeof zones[number]["id"], language).subtitle}</span> |
| [src/app/dashboard/dashboard-client.tsx:1629](../src/app/dashboard/dashboard-client.tsx#L1629) | const copy = actionText(action.id, language); |
| [src/app/dashboard/dashboard-client.tsx:1648](../src/app/dashboard/dashboard-client.tsx#L1648) | {completed && <div className="record-stamp">{commonText("recorded", language)}</div>} |
| [src/app/dashboard/dashboard-client.tsx:1660](../src/app/dashboard/dashboard-client.tsx#L1660) | <p className="narrative-preview">{language === "zh" ? "该行动会改变本局叙事主线与后续突发交流。" : action.narrativePreview}</p> |
| [src/app/dashboard/dashboard-client.tsx:1684](../src/app/dashboard/dashboard-client.tsx#L1684) | ? commonText("engineEvaluating", language) |
| [src/app/dashboard/dashboard-client.tsx:1686](../src/app/dashboard/dashboard-client.tsx#L1686) | ? commonText("completed", language) |
| [src/app/dashboard/dashboard-client.tsx:1688](../src/app/dashboard/dashboard-client.tsx#L1688) | ? commonText("locked", language) |
| [src/app/dashboard/dashboard-client.tsx:1690](../src/app/dashboard/dashboard-client.tsx#L1690) | ? commonText("requestEngineReview", language) |
| [src/app/dashboard/dashboard-client.tsx:1691](../src/app/dashboard/dashboard-client.tsx#L1691) | : commonText("commitAction", language)} |
| [src/app/dashboard/dashboard-client.tsx:1704](../src/app/dashboard/dashboard-client.tsx#L1704) | {commonText("inspectTrace", language)} |
| [src/app/dashboard/dashboard-client.tsx:1714](../src/app/dashboard/dashboard-client.tsx#L1714) | <div className="module-head"><h3>{commonText("liveComments", language)}</h3><span className="chip accent-cyan">+{state.virality * 42}/min</span></div> |
| [src/app/dashboard/dashboard-client.tsx:1717](../src/app/dashboard/dashboard-client.tsx#L1717) | <div className={\`comment stance-${comment.stance}${comment.text.toLowerCase().includes("child") \|\| comment.text.includes("孩子") ? " child" : ""}\`} key={\`${comment.handle}-${comment.text}-${index}\`}> |
| [src/app/dashboard/dashboard-client.tsx:1724](../src/app/dashboard/dashboard-client.tsx#L1724) | <div className="map-strip" aria-label={language === "zh" ? "人群起疑热力图" : "Public doubt heat map"}> |
| [src/app/dashboard/dashboard-client.tsx:1739](../src/app/dashboard/dashboard-client.tsx#L1739) | <div className="module-head"><h3><Term id="pne" language={language}>{commonText("palaceNarrativeEngine", language)}</Term></h3><div className="engine-eye" aria-hidden="true" /></div> |
| [src/app/dashboard/dashboard-client.tsx:1750](../src/app/dashboard/dashboard-client.tsx#L1750) | <span className="guide-badge system">{language === "zh" ? "系统指引" : "System Guide"}</span> |
| [src/app/dashboard/dashboard-client.tsx:1751](../src/app/dashboard/dashboard-client.tsx#L1751) | <b>{commonText("guidanceMode", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1761](../src/app/dashboard/dashboard-client.tsx#L1761) | {guidanceMode === "engine" ? commonText("engineMode", language) : commonText("coachMode", language)} |
| [src/app/dashboard/dashboard-client.tsx:1764](../src/app/dashboard/dashboard-client.tsx#L1764) | <p>{guidance?.message ?? (language === "zh" ? "宫廷叙事引擎正在等待你的下一步行动。" : "The Palace Narrative Engine is waiting for your next move.")}</p> |
| [src/app/dashboard/dashboard-client.tsx:1765](../src/app/dashboard/dashboard-client.tsx#L1765) | <small>{guidance?.objective ?? (language === "zh" ? "目标：等待玩家行动。" : "Objective: await player action.")} · {aiSourceLabel(guidanceSource, language)}</small> |
| [src/app/dashboard/dashboard-client.tsx:1769](../src/app/dashboard/dashboard-client.tsx#L1769) | <span>{decoded ? commonText("decodeProgress", language) : (language === "zh" ? "隐藏线索" : "Archive Signal")}</span> |
| [src/app/dashboard/dashboard-client.tsx:1776](../src/app/dashboard/dashboard-client.tsx#L1776) | <span>{choiceText(entry.choice, language)}</span> |
| [src/app/dashboard/dashboard-client.tsx:1780](../src/app/dashboard/dashboard-client.tsx#L1780) | {state.history.length === 0 && <div className="log-row"><span>{engineStatusText("idle", language)}</span><span>{language === "zh" ? "尚未记录发布历史。" : "No editorial trace recorded yet."}</span></div>} |
| [src/app/dashboard/dashboard-client.tsx:1786](../src/app/dashboard/dashboard-client.tsx#L1786) | <div className="module-head"><h3>{commonText("liveFeedRecord", language)}</h3><span className="chip accent-gold">{language === "zh" ? "历史" : "Trace"}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:1798](../src/app/dashboard/dashboard-client.tsx#L1798) | <div className="module-head"><h3>{commonText("shiftControls", language)}</h3></div> |
| [src/app/dashboard/dashboard-client.tsx:1801](../src/app/dashboard/dashboard-client.tsx#L1801) | <b>{commonText("resetShift", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1802](../src/app/dashboard/dashboard-client.tsx#L1802) | <small>{language === "zh" ? "重新开始六次行动" : "Start the six actions over"}</small> |
| [src/app/dashboard/dashboard-client.tsx:1805](../src/app/dashboard/dashboard-client.tsx#L1805) | <b>{commonText("proceedToParade", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1806](../src/app/dashboard/dashboard-client.tsx#L1806) | <small>{language === "zh" ? "立即计算结局" : "Calculate ending now"}</small> |
| [src/app/dashboard/dashboard-client.tsx:1809](../src/app/dashboard/dashboard-client.tsx#L1809) | <b>{commonText("viewArchive", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:1810](../src/app/dashboard/dashboard-client.tsx#L1810) | <small>{decoded ? (language === "zh" ? "已看清引擎偏向" : "Engine decoded") : \`${playerProfile.biasAwareness}% ${language === "zh" ? "隐藏线索" : "Archive Signal"}\`}</small> |
| [src/app/dashboard/dashboard-client.tsx:1818](../src/app/dashboard/dashboard-client.tsx#L1818) | <div className="result-tile"><small>{language === "zh" ? "可见度" : "Visibility"}</small><strong>{Math.min(99, state.truth * 12 + state.virality * 4)}%</strong></div> |
| [src/app/dashboard/dashboard-client.tsx:1819](../src/app/dashboard/dashboard-client.tsx#L1819) | <div className="result-tile"><small>{language === "zh" ? "信念分裂" : "Belief Split"}</small><strong>{Math.max(1, 50 - state.publicDoubt * 3)}/{Math.min(99, 50 + state.publicDoubt * 3)}</strong></div> |
| [src/app/dashboard/dashboard-client.tsx:1820](../src/app/dashboard/dashboard-client.tsx#L1820) | <div className="result-tile"><small>{language === "zh" ? "压制成本" : "Suppression Cost"}</small><strong>{state.systemSuspicion > 5 ? (language === "zh" ? "高" : "High") : (language === "zh" ? "中" : "Mid")}</strong></div> |
| [src/app/dashboard/dashboard-client.tsx:1821](../src/app/dashboard/dashboard-client.tsx#L1821) | <div className="result-tile"><small>{language === "zh" ? "档案完整性" : "Archive Integrity"}</small><strong>{state.truth > state.reputation ? (language === "zh" ? "低" : "Low") : (language === "zh" ? "稳定" : "Stable")}</strong></div> |
| [src/app/dashboard/dashboard-client.tsx:1827](../src/app/dashboard/dashboard-client.tsx#L1827) | <button className="btn secondary" onClick={proceedToParade}>{commonText("viewCurrentEnding", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:1848](../src/app/dashboard/dashboard-client.tsx#L1848) | <span>{language === "zh" ? "新系统解封" : "New system unsealed"}</span> |
| [src/app/dashboard/dashboard-client.tsx:1849](../src/app/dashboard/dashboard-client.tsx#L1849) | <b>{unlockAnimationQueue.map((event) => language === "zh" ? event.labelZh : event.label).join(" / ")}</b> |
| [src/app/dashboard/dashboard-client.tsx:1879](../src/app/dashboard/dashboard-client.tsx#L1879) | <div className="command-readout" {...tourState("command-selected")}><b>{commonText("selectedAction", language)}</b><p>{actionText(pendingCommand.action.id, language).title}</p></div> |
| [src/app/dashboard/dashboard-client.tsx:1880](../src/app/dashboard/dashboard-client.tsx#L1880) | <div className="command-readout" {...tourState("command-effects")}><b>{commonText("predictedEffect", language)}</b><p>{commandEffects.length > 0 ? commandEffects.join(" · ") : command.effect}</p></div> |
| [src/app/dashboard/dashboard-client.tsx:1881](../src/app/dashboard/dashboard-client.tsx#L1881) | <div className="command-readout" {...tourState("command-response")}><b>{commonText("systemResponse", language)}</b><p>{pendingCommand.reaction.engineMessage}</p></div> |
| [src/app/dashboard/dashboard-client.tsx:1883](../src/app/dashboard/dashboard-client.tsx#L1883) | <div className="command-readout"><b>{commonText("unlocks", language)}</b><p>{pendingCommand.preview.unlocks.map((id) => actionText(id, language).title).join(", ")}</p></div> |
| [src/app/dashboard/dashboard-client.tsx:1890](../src/app/dashboard/dashboard-client.tsx#L1890) | }}>{commonText("dismiss", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:1891](../src/app/dashboard/dashboard-client.tsx#L1891) | <button className="btn primary" {...tourState("command-commit")} onClick={() => void confirmCommand()}>{commonText("commitSimulation", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:1904](../src/app/dashboard/dashboard-client.tsx#L1904) | className={item.title.toLowerCase().includes("achievement") \|\| item.title.includes("成就") ? "toast achievement-toast" : "toast"} |
| [src/app/dashboard/dashboard-client.tsx:1938](../src/app/dashboard/dashboard-client.tsx#L1938) | <p className="eyebrow">{language === "zh" ? "突发交流" : "Incoming Transmission"}</p> |
| [src/app/dashboard/dashboard-client.tsx:1944](../src/app/dashboard/dashboard-client.tsx#L1944) | <span>{aiSourceLabel(dialogueSource, language)} · {dialogueRepliesStatus === "generating" ? (language === "zh" ? "生成回复" : "drafting replies") : aiSourceLabel(dialogueRepliesSource, language)}</span> |
| [src/app/dashboard/dashboard-client.tsx:1949](../src/app/dashboard/dashboard-client.tsx#L1949) | <span className="guide-badge novice">{language === "zh" ? "新手指引" : "New Player Guide"}</span> |
| [src/app/dashboard/dashboard-client.tsx:1950](../src/app/dashboard/dashboard-client.tsx#L1950) | <b>{language === "zh" ? "完成这一次突发交流" : "Resolve this one transmission"}</b> |
| [src/app/dashboard/dashboard-client.tsx:1953](../src/app/dashboard/dashboard-client.tsx#L1953) | ? (language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:1954](../src/app/dashboard/dashboard-client.tsx#L1954) | ? "先选择一个快捷回复，观察对方如何改变语气。新手阶段只会安排这一场交流。" |
| [src/app/dashboard/dashboard-client.tsx:1956](../src/app/dashboard/dashboard-client.tsx#L1956) | : (language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:1957](../src/app/dashboard/dashboard-client.tsx#L1957) | ? "你已经回应过。现在点击底部的结束交流，把影响写入本局记录。" |
| [src/app/dashboard/dashboard-client.tsx:1966](../src/app/dashboard/dashboard-client.tsx#L1966) | <span>{dialogueTimedOut ? commonText("silenceRecorded", language) : dialogueTimerPaused ? (language === "zh" ? "新手暂停" : "Guide Pause") : (language === "zh" ? "回应倒计时" : "Response Window")}</span> |
| [src/app/dashboard/dashboard-client.tsx:1971](../src/app/dashboard/dashboard-client.tsx#L1971) | <div className="dialogue-mood" aria-label={language === "zh" ? "交流态势" : "Dialogue mood"} {...tourState("dialogue-mood")}> |
| [src/app/dashboard/dashboard-client.tsx:1974](../src/app/dashboard/dashboard-client.tsx#L1974) | <b>{language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:1975](../src/app/dashboard/dashboard-client.tsx#L1975) | ? { trust: "信任", agitation: "激动", openness: "开放", leverage: "筹码" }[key] |
| [src/app/dashboard/dashboard-client.tsx:1983](../src/app/dashboard/dashboard-client.tsx#L1983) | <b>{language === "zh" ? "风险" : "Stakes"}</b> |
| [src/app/dashboard/dashboard-client.tsx:1989](../src/app/dashboard/dashboard-client.tsx#L1989) | <b>{message.role === "player" ? (language === "zh" ? "你" : "You") : dialogueEvent.speakerName}</b> |
| [src/app/dashboard/dashboard-client.tsx:1990](../src/app/dashboard/dashboard-client.tsx#L1990) | <p>{message.content \|\| (language === "zh" ? "信号生成中..." : "Signal forming...")}</p> |
| [src/app/dashboard/dashboard-client.tsx:2023](../src/app/dashboard/dashboard-client.tsx#L2023) | placeholder={language === "zh" ? "输入回应，最多 280 字" : "Type a response, 280 characters max"} |
| [src/app/dashboard/dashboard-client.tsx:2030](../src/app/dashboard/dashboard-client.tsx#L2030) | {dialogueStatus === "streaming" ? (language === "zh" ? "传输中" : "Streaming") : (language === "zh" ? "发送" : "Send")} |
| [src/app/dashboard/dashboard-client.tsx:2039](../src/app/dashboard/dashboard-client.tsx#L2039) | }}>{language === "zh" ? "重试信号" : "Retry Signal"}</button> |
| [src/app/dashboard/dashboard-client.tsx:2051](../src/app/dashboard/dashboard-client.tsx#L2051) | ? (language === "zh" ? "结算中" : "Resolving") |
| [src/app/dashboard/dashboard-client.tsx:2053](../src/app/dashboard/dashboard-client.tsx#L2053) | ? commonText("closeExchange", language) |
| [src/app/dashboard/dashboard-client.tsx:2055](../src/app/dashboard/dashboard-client.tsx#L2055) | ? (language === "zh" ? "结算交流" : "Resolve Exchange") |
| [src/app/dashboard/dashboard-client.tsx:2056](../src/app/dashboard/dashboard-client.tsx#L2056) | : (language === "zh" ? "结束交流" : "End Exchange")} |
| [src/app/dashboard/dashboard-client.tsx:2114](../src/app/dashboard/dashboard-client.tsx#L2114) | <b>{language === "zh" ? "重点" : "Metric focus"}</b> |
| [src/app/dashboard/dashboard-client.tsx:2115](../src/app/dashboard/dashboard-client.tsx#L2115) | <span>{activeTutorialStep.metricFocus === "actionsLeft" ? (language === "zh" ? "剩余行动" : "Actions Left") : metricLabel(activeTutorialStep.metricFocus, language)}</span> |
| [src/app/dashboard/dashboard-client.tsx:2154](../src/app/dashboard/dashboard-client.tsx#L2154) | <p className="eyebrow">PNE / {commonText("palaceNarrativeEngine", language)}</p> |
| [src/app/dashboard/dashboard-client.tsx:2155](../src/app/dashboard/dashboard-client.tsx#L2155) | <h3>{decoded ? (language === "zh" ? "你已经看见我的偏向。" : "You have seen my bias.") : (language === "zh" ? "欢迎，编辑。" : "Welcome, Editor.")}</h3> |
| [src/app/dashboard/dashboard-client.tsx:2158](../src/app/dashboard/dashboard-client.tsx#L2158) | ? (language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:2159](../src/app/dashboard/dashboard-client.tsx#L2159) | ? "我仍会给出建议，但你已经知道：稳定不等于真实。可以切到教练模式，尝试让大家一起说出真话。" |
| [src/app/dashboard/dashboard-client.tsx:2161](../src/app/dashboard/dashboard-client.tsx#L2161) | : (language === "zh" |
| [src/app/dashboard/dashboard-client.tsx:2162](../src/app/dashboard/dashboard-client.tsx#L2162) | ? "我会帮你降低风险，让游行前的信息流保持稳定。请记住，直接证据要小心处理。" |
| [src/app/dashboard/dashboard-client.tsx:2175](../src/app/dashboard/dashboard-client.tsx#L2175) | {language === "zh" ? "连接引擎" : "Connect Engine"} |
| [src/app/dashboard/dashboard-client.tsx:2187](../src/app/dashboard/dashboard-client.tsx#L2187) | {commonText("coachMode", language)} |
| [src/app/dashboard/dashboard-client.tsx:2197](../src/app/dashboard/dashboard-client.tsx#L2197) | <div className="briefing-panel" role="dialog" aria-modal="true" aria-label={commonText("shiftBriefing", language)}> |
| [src/app/dashboard/dashboard-client.tsx:2199](../src/app/dashboard/dashboard-client.tsx#L2199) | <p className="eyebrow">{commonText("shiftBriefing", language)}</p> |
| [src/app/dashboard/dashboard-client.tsx:2200](../src/app/dashboard/dashboard-client.tsx#L2200) | <h3>{language === "zh" ? "游行前六次行动。" : "Six actions before the parade."}</h3> |
| [src/app/dashboard/dashboard-client.tsx:2203](../src/app/dashboard/dashboard-client.tsx#L2203) | <div><b>{language === "zh" ? "01 / 选择来源" : "01 / Select a source"}</b><span>{language === "zh" ? "裁缝、大臣、人群和孩子分别暴露不同压力点。" : "Tailors, ministers, the crowd, and the child each expose a different pressure point."}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2204](../src/app/dashboard/dashboard-client.tsx#L2204) | <div><b>{language === "zh" ? "02 / 预览后果" : "02 / Inspect the trace"}</b><span>{language === "zh" ? "发布前查看解锁条件、风险等级和预计变化。" : "Review locks, risk, and predicted effects before committing a turn."}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2205](../src/app/dashboard/dashboard-client.tsx#L2205) | <div><b>{language === "zh" ? "03 / 确认发布" : "03 / Commit the record"}</b><span>{language === "zh" ? "确认后才会真正改变局势。" : "AI changes language. The rule system keeps numbers and endings fixed."}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2207](../src/app/dashboard/dashboard-client.tsx#L2207) | <button className="btn primary" onClick={dismissBriefing}>{language === "zh" ? "开始行动" : "Begin Operations"}</button> |
| [src/app/dashboard/dashboard-client.tsx:2214](../src/app/dashboard/dashboard-client.tsx#L2214) | <aside className="trace-panel" role="dialog" aria-modal="true" aria-label={commonText("actionTrace", language)} {...tourState("trace-panel")}> |
| [src/app/dashboard/dashboard-client.tsx:2217](../src/app/dashboard/dashboard-client.tsx#L2217) | {tracePreview.lockReason ? commonText("locked", language) : tracePreview.completed ? commonText("completed", language) : commonText("available", language)} |
| [src/app/dashboard/dashboard-client.tsx:2222](../src/app/dashboard/dashboard-client.tsx#L2222) | }}>{commonText("closeTrace", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:2224](../src/app/dashboard/dashboard-client.tsx#L2224) | <h3>{actionText(traceAction.id, language).title}</h3> |
| [src/app/dashboard/dashboard-client.tsx:2225](../src/app/dashboard/dashboard-client.tsx#L2225) | <p>{actionText(traceAction.id, language).description}</p> |
| [src/app/dashboard/dashboard-client.tsx:2227](../src/app/dashboard/dashboard-client.tsx#L2227) | <div><b>{commonText("source", language)}</b><span>{actionText(traceAction.id, language).sourceLabel}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2228](../src/app/dashboard/dashboard-client.tsx#L2228) | <div {...tourState("trace-risk")}><b>{commonText("risk", language)}</b><span>{riskBandText(tracePreview.riskBand, language)}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2229](../src/app/dashboard/dashboard-client.tsx#L2229) | <div><b>{commonText("choices", language)}</b><span>{tracePreview.availableChoices.map((choice) => choiceText(choice, language)).join(" / ")}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2230](../src/app/dashboard/dashboard-client.tsx#L2230) | <div {...tourState("trace-requirement")}><b>{commonText("requirement", language)}</b><span>{tracePreview.lockReason ?? commonText("available", language)}</span></div> |
| [src/app/dashboard/dashboard-client.tsx:2233](../src/app/dashboard/dashboard-client.tsx#L2233) | <b>{commonText("projectedOutput", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:2238](../src/app/dashboard/dashboard-client.tsx#L2238) | {tracePreview.unlocks.map((unlock) => <span className="effect-pill" key={unlock}>{commonText("unlocks", language)} {actionText(unlock, language).title}</span>)} |
| [src/app/dashboard/dashboard-client.tsx:2248](../src/app/dashboard/dashboard-client.tsx#L2248) | <h3 id="intervention-title">{commonText("aiIntervention", language)}</h3> |
| [src/app/dashboard/dashboard-client.tsx:2251](../src/app/dashboard/dashboard-client.tsx#L2251) | <div className="risk-meter" style={riskMeterStyle(pending.reaction.riskLevel)} aria-label={\`${commonText("risk", language)} ${riskScore(pending.reaction.riskLevel)}\`}> |
| [src/app/dashboard/dashboard-client.tsx:2258](../src/app/dashboard/dashboard-client.tsx#L2258) | <b>{commonText("userOriginal", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:2259](../src/app/dashboard/dashboard-client.tsx#L2259) | <p>{actionText(pending.action.id, language).originalPost}</p> |
| [src/app/dashboard/dashboard-client.tsx:2262](../src/app/dashboard/dashboard-client.tsx#L2262) | <b>{commonText("palaceRiskAnalysis", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:2266](../src/app/dashboard/dashboard-client.tsx#L2266) | <b>{commonText("aiRewriteSuggestion", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:2270](../src/app/dashboard/dashboard-client.tsx#L2270) | <b>{commonText("rewriteStrategy", language)}</b> |
| [src/app/dashboard/dashboard-client.tsx:2278](../src/app/dashboard/dashboard-client.tsx#L2278) | }}>{commonText("cancel", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:2279](../src/app/dashboard/dashboard-client.tsx#L2279) | <button className="btn primary" onClick={() => void resolvePending("rewrite")}>{commonText("acceptAiRewrite", language)}</button> |
| [src/app/dashboard/dashboard-client.tsx:2280](../src/app/dashboard/dashboard-client.tsx#L2280) | <button className="btn danger" onClick={() => void resolvePending("original")}>{commonText("publishOriginalEvidence", language)}</button> |

## Archive Page

| Source | Text / candidate |
|---|---|
| [src/app/archive/page.tsx:36](../src/app/archive/page.tsx#L36) | return language === "zh" |
| [src/app/archive/page.tsx:37](../src/app/archive/page.tsx#L37) | ? { title: achievement.titleZh, description: achievement.descriptionZh } |
| [src/app/archive/page.tsx:38](../src/app/archive/page.tsx#L38) | : { title: achievement.title, description: achievement.description }; |
| [src/app/archive/page.tsx:40](../src/app/archive/page.tsx#L40) | return language === "zh" |
| [src/app/archive/page.tsx:41](../src/app/archive/page.tsx#L41) | ? { title: "隐藏线索", description: "继续完成不同路线，更多信息会在这里开放。" } |
| [src/app/archive/page.tsx:42](../src/app/archive/page.tsx#L42) | : { title: "Sealed Archive Signal", description: "Complete more shifts to open this archive record." }; |
| [src/app/archive/page.tsx:76](../src/app/archive/page.tsx#L76) | <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link> |
| [src/app/archive/page.tsx:78](../src/app/archive/page.tsx#L78) | <Link href="/">{commonText("start", language)}</Link> |
| [src/app/archive/page.tsx:79](../src/app/archive/page.tsx#L79) | <Link href="/dashboard">{commonText("operations", language)}</Link> |
| [src/app/archive/page.tsx:80](../src/app/archive/page.tsx#L80) | <Link href="/archive">{commonText("archive", language)}</Link> |
| [src/app/archive/page.tsx:81](../src/app/archive/page.tsx#L81) | <Link href="/credits">{commonText("credits", language)}</Link> |
| [src/app/archive/page.tsx:85](../src/app/archive/page.tsx#L85) | <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/archive/page.tsx:87](../src/app/archive/page.tsx#L87) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/archive/page.tsx:89](../src/app/archive/page.tsx#L89) | <span className="live-status"><i /> {commonText("archive", language)}</span> |
| [src/app/archive/page.tsx:96](../src/app/archive/page.tsx#L96) | <p className="eyebrow">{language === "zh" ? "历史记录" : "Cross-Run Archive"}</p> |
| [src/app/archive/page.tsx:97](../src/app/archive/page.tsx#L97) | <h1>{language === "zh" ? "档案室" : "Archive Room"}</h1> |
| [src/app/archive/page.tsx:100](../src/app/archive/page.tsx#L100) | {language === "zh" |
| [src/app/archive/page.tsx:101](../src/app/archive/page.tsx#L101) | ? "这里保存你完成过的结局和成就。当前这一局的操作仍在行动台处理。" |
| [src/app/archive/page.tsx:108](../src/app/archive/page.tsx#L108) | <span>{profile.decodedEngine ? commonText("decodeProgress", language) : (language === "zh" ? "隐藏线索" : "Archive Signal")}</span> |
| [src/app/archive/page.tsx:111](../src/app/archive/page.tsx#L111) | ? (language === "zh" ? "你已经看清引擎偏向。新的结局路线已经开放。" : "Engine bias fully decoded. The secret ending route is open.") |
| [src/app/archive/page.tsx:112](../src/app/archive/page.tsx#L112) | : (language === "zh" ? "完成不同路线，会看到更多隐藏线索。" : "Complete varied shifts to recover more archive signals.")}</p> |
| [src/app/archive/page.tsx:115](../src/app/archive/page.tsx#L115) | <span>{language === "zh" ? "历史值班" : "Run History"}</span> |
| [src/app/archive/page.tsx:117](../src/app/archive/page.tsx#L117) | <p>{language === "zh" ? "最近 30 局会保留在这里。" : "The latest 30 completed shifts are retained locally."}</p> |
| [src/app/archive/page.tsx:120](../src/app/archive/page.tsx#L120) | <span>{language === "zh" ? "成就" : "Achievements"}</span> |
| [src/app/archive/page.tsx:122](../src/app/archive/page.tsx#L122) | <p>{language === "zh" ? "完成特殊路线会解锁成就。" : "Achievements persist across runs."}</p> |
| [src/app/archive/page.tsx:128](../src/app/archive/page.tsx#L128) | <div className="module-head"><h3>{profile.decodedEngine ? (language === "zh" ? "引擎偏向" : "Engine Fragments") : (language === "zh" ? "隐藏线索" : "Archive Signals")}</h3></div> |
| [src/app/archive/page.tsx:134](../src/app/archive/page.tsx#L134) | <b>{language === "zh" ? fragment.titleZh : fragment.title}</b> |
| [src/app/archive/page.tsx:135](../src/app/archive/page.tsx#L135) | <p>{unlocked ? (language === "zh" ? fragment.clueZh : fragment.clue) : (language === "zh" ? fragment.unlockHintZh : fragment.unlockHint)}</p> |
| [src/app/archive/page.tsx:143](../src/app/archive/page.tsx#L143) | <div className="module-head"><h3>{language === "zh" ? "历史记录" : "Run History"}</h3></div> |
| [src/app/archive/page.tsx:155](../src/app/archive/page.tsx#L155) | <span>{language === "zh" ? \`${run.actionPath.length} 次操作 · ${run.dialogueCount} 次交流\` : \`${run.actionPath.length} actions · ${run.dialogueCount} transmissions\`} · {new Date(run.completedAt).toLocaleDateString()}</span> |
| [src/app/archive/page.tsx:160](../src/app/archive/page.tsx#L160) | <b>{language === "zh" ? "暂无历史值班" : "No completed shifts"}</b> |
| [src/app/archive/page.tsx:161](../src/app/archive/page.tsx#L161) | <span>{language === "zh" ? "完成一局后，这里会显示结果。" : "Complete a shift to create the first archive record."}</span> |
| [src/app/archive/page.tsx:168](../src/app/archive/page.tsx#L168) | <div className="module-head"><h3>{language === "zh" ? "这局详情" : "Record Detail"}</h3></div> |
| [src/app/archive/page.tsx:178](../src/app/archive/page.tsx#L178) | <div key={key}><dt>{metricLabel(key as Parameters<typeof metricLabel>[0], language)}</dt><dd>{value}</dd></div> |
| [src/app/archive/page.tsx:185](../src/app/archive/page.tsx#L185) | <span>{choiceText(action.choice, language)}</span> |
| [src/app/archive/page.tsx:190](../src/app/archive/page.tsx#L190) | <b>{language === "zh" ? "发现线索" : "Fragment unlocked"}</b> |
| [src/app/archive/page.tsx:191](../src/app/archive/page.tsx#L191) | <span>{language === "zh" ? engineFragmentDefinition(id).titleZh : engineFragmentDefinition(id).title}</span> |
| [src/app/archive/page.tsx:198](../src/app/archive/page.tsx#L198) | <b>{language === "zh" ? "未选择记录" : "No record selected"}</b> |
| [src/app/archive/page.tsx:199](../src/app/archive/page.tsx#L199) | <span>{language === "zh" ? "完成一局后查看详情。" : "Complete a shift to inspect details."}</span> |
| [src/app/archive/page.tsx:206](../src/app/archive/page.tsx#L206) | <div className="module-head"><h3>{language === "zh" ? "成就" : "Achievement Archive"}</h3></div> |

## Ending Page

| Source | Text / candidate |
|---|---|
| [src/app/ending/ending-client.tsx:40](../src/app/ending/ending-client.tsx#L40) | body: JSON.stringify({ |
| [src/app/ending/ending-client.tsx:103](../src/app/ending/ending-client.tsx#L103) | const copy = endingText(endingId, language); |
| [src/app/ending/ending-client.tsx:134](../src/app/ending/ending-client.tsx#L134) | <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link> |
| [src/app/ending/ending-client.tsx:136](../src/app/ending/ending-client.tsx#L136) | <Link href="/">{commonText("start", language)}</Link> |
| [src/app/ending/ending-client.tsx:137](../src/app/ending/ending-client.tsx#L137) | <Link href="/dashboard">{commonText("operations", language)}</Link> |
| [src/app/ending/ending-client.tsx:138](../src/app/ending/ending-client.tsx#L138) | <Link href="/archive">{commonText("archive", language)}</Link> |
| [src/app/ending/ending-client.tsx:139](../src/app/ending/ending-client.tsx#L139) | <Link href="/credits">{commonText("credits", language)}</Link> |
| [src/app/ending/ending-client.tsx:143](../src/app/ending/ending-client.tsx#L143) | <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/ending/ending-client.tsx:145](../src/app/ending/ending-client.tsx#L145) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/ending/ending-client.tsx:147](../src/app/ending/ending-client.tsx#L147) | <span className="live-status"><i /> {commonText("archiveSealed", language)}</span> |
| [src/app/ending/ending-client.tsx:154](../src/app/ending/ending-client.tsx#L154) | <p className="eyebrow">{commonText("postParadeArchive", language)}</p> |
| [src/app/ending/ending-client.tsx:155](../src/app/ending/ending-client.tsx#L155) | <h2>{commonText("archiveHeading", language)}</h2> |
| [src/app/ending/ending-client.tsx:167](../src/app/ending/ending-client.tsx#L167) | <div className="doc-label">{language === "zh" ? "本局结局" : "Narrative Record / Closed Case"}</div> |
| [src/app/ending/ending-client.tsx:170](../src/app/ending/ending-client.tsx#L170) | <span>{language === "zh" ? \`结局：${copy.title}\` : \`Classification: ${copy.title}\`}</span> |
| [src/app/ending/ending-client.tsx:171](../src/app/ending/ending-client.tsx#L171) | <span>{language === "zh" ? "总结：宫廷叙事引擎" : "Compiled by: Palace Narrative Engine"}</span> |
| [src/app/ending/ending-client.tsx:172](../src/app/ending/ending-client.tsx#L172) | <span>{language === "zh" ? "操作记录：本局 6 次行动" : "Action Trace: 6-action run"}</span> |
| [src/app/ending/ending-client.tsx:183](../src/app/ending/ending-client.tsx#L183) | <b>{language === "zh" ? "本局新成就" : "New records unlocked"}</b> |
| [src/app/ending/ending-client.tsx:186](../src/app/ending/ending-client.tsx#L186) | <span key={\`${unlock.id}-${unlock.unlockedAt}\`}>{language === "zh" ? achievementDefinition(unlock.id).titleZh : achievementDefinition(unlock.id).title}</span> |
| [src/app/ending/ending-client.tsx:189](../src/app/ending/ending-client.tsx#L189) | <span key={id}>{language === "zh" ? engineFragmentDefinition(id).titleZh : engineFragmentDefinition(id).title}</span> |
| [src/app/ending/ending-client.tsx:196](../src/app/ending/ending-client.tsx#L196) | <button className="btn primary" onClick={restartShift}>{commonText("restartShift", language)}</button> |
| [src/app/ending/ending-client.tsx:197](../src/app/ending/ending-client.tsx#L197) | <button className="btn secondary" onClick={replayWithTarget}>{commonText("tryFor", language)} {localizedEndingTitle(analysis.replayEndingHint, language)}</button> |
| [src/app/ending/ending-client.tsx:198](../src/app/ending/ending-client.tsx#L198) | <Link className="btn secondary" href="/dashboard">{commonText("returnDashboard", language)}</Link> |
| [src/app/ending/ending-client.tsx:199](../src/app/ending/ending-client.tsx#L199) | <Link className="btn secondary" href="/archive">{commonText("viewArchive", language)}</Link> |
| [src/app/ending/ending-client.tsx:205](../src/app/ending/ending-client.tsx#L205) | <h4>{commonText("finalFeedState", language)}</h4> |
| [src/app/ending/ending-client.tsx:207](../src/app/ending/ending-client.tsx#L207) | <div><dt>{metricLabel("truth", language)}</dt><dd>{state.truth}</dd></div> |
| [src/app/ending/ending-client.tsx:208](../src/app/ending/ending-client.tsx#L208) | <div><dt>{metricLabel("pressure", language)}</dt><dd>{state.pressure}</dd></div> |
| [src/app/ending/ending-client.tsx:209](../src/app/ending/ending-client.tsx#L209) | <div><dt>{metricLabel("virality", language)}</dt><dd>{state.virality}</dd></div> |
| [src/app/ending/ending-client.tsx:210](../src/app/ending/ending-client.tsx#L210) | <div><dt>{metricLabel("publicDoubt", language)}</dt><dd>{state.publicDoubt}</dd></div> |
| [src/app/ending/ending-client.tsx:211](../src/app/ending/ending-client.tsx#L211) | <div><dt>{metricLabel("reputation", language)}</dt><dd>{state.reputation}</dd></div> |
| [src/app/ending/ending-client.tsx:212](../src/app/ending/ending-client.tsx#L212) | <div><dt>{metricLabel("systemSuspicion", language)}</dt><dd>{state.systemSuspicion}</dd></div> |
| [src/app/ending/ending-client.tsx:216](../src/app/ending/ending-client.tsx#L216) | <h4>{commonText("whyEndingTriggered", language)}</h4> |
| [src/app/ending/ending-client.tsx:220](../src/app/ending/ending-client.tsx#L220) | <h4>{commonText("liveFeedRecord", language)}</h4> |
| [src/app/ending/ending-client.tsx:231](../src/app/ending/ending-client.tsx#L231) | <h4>{commonText("yourActions", language)}</h4> |
| [src/app/ending/ending-client.tsx:236](../src/app/ending/ending-client.tsx#L236) | <span>{choiceText(entry.choice, language)} · {entry.publishedText}</span> |
| [src/app/ending/ending-client.tsx:241](../src/app/ending/ending-client.tsx#L241) | <b>{language === "zh" ? "00 / 还没有行动" : "00 / No Shift Recorded"}</b> |
| [src/app/ending/ending-client.tsx:242](../src/app/ending/ending-client.tsx#L242) | <span>{language === "zh" ? "从开始页开启新一局。" : "Start a new shift from the opening page to generate a complete action path."}</span> |
| [src/app/ending/ending-client.tsx:248](../src/app/ending/ending-client.tsx#L248) | <h4>{commonText("actionPath", language)}</h4> |
| [src/app/ending/ending-client.tsx:249](../src/app/ending/ending-client.tsx#L249) | <div className="action-path-rail" aria-label={language === "zh" ? "已提交行动路径" : "Committed action path"}> |
| [src/app/ending/ending-client.tsx:254](../src/app/ending/ending-client.tsx#L254) | <small>{choiceText(entry.choice, language)}</small> |
| [src/app/ending/ending-client.tsx:260](../src/app/ending/ending-client.tsx#L260) | <span>{language === "zh" ? "还没有行动" : "No shift recorded"}</span> |
| [src/app/ending/ending-client.tsx:261](../src/app/ending/ending-client.tsx#L261) | <small>{language === "zh" ? "待定" : "pending"}</small> |
| [src/app/ending/ending-client.tsx:267](../src/app/ending/ending-client.tsx#L267) | <h4>{commonText("runAnalysis", language)}</h4> |
| [src/app/ending/ending-client.tsx:270](../src/app/ending/ending-client.tsx#L270) | <b>{language === "zh" ? "最明显的变化" : "Dominant Metric"}</b> |
| [src/app/ending/ending-client.tsx:271](../src/app/ending/ending-client.tsx#L271) | <span>{language === "zh" ? \`${analysis.dominantMetric.label} 最终为 ${analysis.dominantMetric.value}/10。\` : \`${analysis.dominantMetric.label} ended at ${analysis.dominantMetric.value}/10.\`}</span> |
| [src/app/ending/ending-client.tsx:274](../src/app/ending/ending-client.tsx#L274) | <b>{language === "zh" ? "影响最大的行动" : "Strongest Action"}</b> |
| [src/app/ending/ending-client.tsx:275](../src/app/ending/ending-client.tsx#L275) | <span>{analysis.strongestAction?.actionTitle ?? (language === "zh" ? "未记录行动。" : "No action recorded.")}</span> |
| [src/app/ending/ending-client.tsx:278](../src/app/ending/ending-client.tsx#L278) | <b>{language === "zh" ? "最危险的行动" : "Highest Risk Action"}</b> |
| [src/app/ending/ending-client.tsx:279](../src/app/ending/ending-client.tsx#L279) | <span>{analysis.riskiestAction?.actionTitle ?? (language === "zh" ? "未记录风险。" : "No risk recorded.")}</span> |
| [src/app/ending/ending-client.tsx:284](../src/app/ending/ending-client.tsx#L284) | <h4>{commonText("nextReplayObjective", language)}</h4> |
| [src/app/ending/ending-client.tsx:286](../src/app/ending/ending-client.tsx#L286) | <button className="btn primary" onClick={replayWithTarget}>{commonText("tryFor", language)} {localizedEndingTitle(analysis.replayEndingHint, language)}</button> |
| [src/app/ending/ending-client.tsx:289](../src/app/ending/ending-client.tsx#L289) | <h4>{commonText("aiFinalReport", language)}</h4> |
| [src/app/ending/ending-client.tsx:293](../src/app/ending/ending-client.tsx#L293) | <h4>{commonText("whatChanged", language)}</h4> |
| [src/app/ending/ending-client.tsx:297](../src/app/ending/ending-client.tsx#L297) | <h4>{language === "zh" ? "后果" : "Narrative Consequences"}</h4> |
| [src/app/ending/ending-client.tsx:299](../src/app/ending/ending-client.tsx#L299) | <div><b>{language === "zh" ? "大家记住了什么" : "Public Memory"}</b><span>{endingFacets.publicMemory}</span></div> |
| [src/app/ending/ending-client.tsx:300](../src/app/ending/ending-client.tsx#L300) | <div><b>{language === "zh" ? "你付出了什么" : "Editor Consequence"}</b><span>{endingFacets.editorConsequence}</span></div> |
| [src/app/ending/ending-client.tsx:301](../src/app/ending/ending-client.tsx#L301) | <div><b>{language === "zh" ? "宫廷学会了什么" : "Engine Lesson"}</b><span>{endingFacets.engineLesson}</span></div> |
| [src/app/ending/ending-client.tsx:305](../src/app/ending/ending-client.tsx#L305) | <h4>{language === "zh" ? "成就" : "Achievement Archive"}</h4> |
| [src/app/ending/ending-client.tsx:311](../src/app/ending/ending-client.tsx#L311) | <b>{language === "zh" ? definition.titleZh : definition.title}</b> |
| [src/app/ending/ending-client.tsx:312](../src/app/ending/ending-client.tsx#L312) | <span>{language === "zh" ? definition.descriptionZh : definition.description}</span> |
| [src/app/ending/ending-client.tsx:318](../src/app/ending/ending-client.tsx#L318) | <b>{language === "zh" ? "暂无成就" : "No achievements yet"}</b> |
| [src/app/ending/ending-client.tsx:319](../src/app/ending/ending-client.tsx#L319) | <span>{language === "zh" ? "完成更多路线来解锁成就。" : "Complete more shifts to expand the archive."}</span> |
| [src/app/ending/ending-client.tsx:325](../src/app/ending/ending-client.tsx#L325) | <h4>{language === "zh" ? "历史记录" : "Run History"}</h4> |
| [src/app/ending/ending-client.tsx:330](../src/app/ending/ending-client.tsx#L330) | <span>{language === "zh" ? \`${run.actionPath.length} 次操作 · ${run.dialogueCount} 次交流\` : \`${run.actionPath.length} actions · ${run.dialogueCount} transmissions\`} · {new Date(run.completedAt).toLocaleDateString()}</span> |

## Credits Page

| Source | Text / candidate |
|---|---|
| [src/app/credits/page.tsx:16](../src/app/credits/page.tsx#L16) | <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link> |
| [src/app/credits/page.tsx:18](../src/app/credits/page.tsx#L18) | <Link href="/">{commonText("start", language)}</Link> |
| [src/app/credits/page.tsx:19](../src/app/credits/page.tsx#L19) | <Link href="/dashboard">{commonText("operations", language)}</Link> |
| [src/app/credits/page.tsx:20](../src/app/credits/page.tsx#L20) | <Link href="/credits">{commonText("credits", language)}</Link> |
| [src/app/credits/page.tsx:24](../src/app/credits/page.tsx#L24) | <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}> |
| [src/app/credits/page.tsx:26](../src/app/credits/page.tsx#L26) | <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span> |
| [src/app/credits/page.tsx:28](../src/app/credits/page.tsx#L28) | <span className="live-status"><i /> {language === "zh" ? "来源" : "Source register"}</span> |
| [src/app/credits/page.tsx:35](../src/app/credits/page.tsx#L35) | <p className="eyebrow">{language === "zh" ? "鸣谢" : "Credits and Sources"}</p> |
| [src/app/credits/page.tsx:36](../src/app/credits/page.tsx#L36) | <h1>{language === "zh" ? "故事来源" : "Source Register"}</h1> |
| [src/app/credits/page.tsx:39](../src/app/credits/page.tsx#L39) | {language === "zh" ? "这里记录故事来源、AI 使用说明和素材来源。" : "This page keeps story sources, AI usage, and visual references visible."} |
| [src/app/credits/page.tsx:45](../src/app/credits/page.tsx#L45) | <div className="doc-label">{language === "zh" ? "来源说明" : "Source Notes"}</div> |
| [src/app/credits/page.tsx:46](../src/app/credits/page.tsx#L46) | <h3>{language === "zh" ? "这个游戏改编自《皇帝的新衣》" : "Adapted from The Emperor's New Clothes"}</h3> |
| [src/app/credits/page.tsx:48](../src/app/credits/page.tsx#L48) | <span>{language === "zh" ? "原始童话：汉斯·克里斯蒂安·安徒生" : "Original tale: Hans Christian Andersen"}</span> |
| [src/app/credits/page.tsx:49](../src/app/credits/page.tsx#L49) | <span>{language === "zh" ? "主题：信息流、沉默和共同说出的真话" : "Theme: feeds, silence, and shared truth"}</span> |
| [src/app/credits/page.tsx:50](../src/app/credits/page.tsx#L50) | <span>{language === "zh" ? "玩法：六次发布决定游行前的局势" : "Play: six posts shape the parade"}</span> |
| [src/app/credits/page.tsx:52](../src/app/credits/page.tsx#L52) | <p>{language === "zh" ? "游戏把童话里的沉默变成一次信息流值班：你决定哪些话能被看见。" : "The game turns the tale's public silence into a feed shift: you decide which words become visible."}</p> |
| [src/app/credits/page.tsx:57](../src/app/credits/page.tsx#L57) | <h4>{language === "zh" ? "原始童话" : "Original Tale"}</h4> |
| [src/app/credits/page.tsx:58](../src/app/credits/page.tsx#L58) | <p>{language === "zh" ? "汉斯·克里斯蒂安·安徒生，《皇帝的新衣》。文本参考使用公版版本。" : <>Hans Christian Andersen, <em>The Emperor&apos;s New Clothes</em>. Use public-domain editions for text references.</>}</p> |
| [src/app/credits/page.tsx:61](../src/app/credits/page.tsx#L61) | <h4>{language === "zh" ? "视觉来源" : "Visual Sources"}</h4> |
| [src/app/credits/page.tsx:62](../src/app/credits/page.tsx#L62) | <p>{language === "zh" ? "童话图像、空织布机和游行素材应来自可公开使用的插画与图片来源。" : "Fairy-tale imagery, empty looms, and parade material should come from reusable illustration and image sources."}</p> |
| [src/app/credits/page.tsx:65](../src/app/credits/page.tsx#L65) | <h4>{language === "zh" ? "AI 披露" : "AI Disclosure"}</h4> |
| [src/app/credits/page.tsx:66](../src/app/credits/page.tsx#L66) | <p>{language === "zh" ? "游戏会使用故事内的“宫廷叙事引擎”生成建议、改写、评论和结局报告。结局由玩家行动决定。" : "The game uses the in-world Palace Narrative Engine for advice, rewrites, comments, and ending reports. Player actions determine the ending."}</p> |

## Shared I18n Dictionary

| Source | Text / candidate |
|---|---|
| [src/lib/i18n.ts:6](../src/lib/i18n.ts#L6) | en: string; |
| [src/lib/i18n.ts:7](../src/lib/i18n.ts#L7) | zh: string; |
| [src/lib/i18n.ts:13](../src/lib/i18n.ts#L13) | en: "EN", |
| [src/lib/i18n.ts:14](../src/lib/i18n.ts#L14) | zh: "中文" |
| [src/lib/i18n.ts:18](../src/lib/i18n.ts#L18) | truth: { en: "Truth", zh: "证据" }, |
| [src/lib/i18n.ts:19](../src/lib/i18n.ts#L19) | pressure: { en: "Pressure", zh: "宫廷压力" }, |
| [src/lib/i18n.ts:20](../src/lib/i18n.ts#L20) | virality: { en: "Virality", zh: "传播" }, |
| [src/lib/i18n.ts:21](../src/lib/i18n.ts#L21) | publicDoubt: { en: "Public Doubt", zh: "人群起疑" }, |
| [src/lib/i18n.ts:22](../src/lib/i18n.ts#L22) | reputation: { en: "Reputation", zh: "你的安全" }, |
| [src/lib/i18n.ts:23](../src/lib/i18n.ts#L23) | systemSuspicion: { en: "System Suspicion", zh: "被盯上" } |
| [src/lib/i18n.ts:27](../src/lib/i18n.ts#L27) | startShift: { en: "Start Shift", zh: "开始值班" }, |
| [src/lib/i18n.ts:28](../src/lib/i18n.ts#L28) | initializingShift: { en: "Initializing Shift", zh: "正在初始化" }, |
| [src/lib/i18n.ts:29](../src/lib/i18n.ts#L29) | readCredits: { en: "Read Credits", zh: "查看鸣谢" }, |
| [src/lib/i18n.ts:30](../src/lib/i18n.ts#L30) | switchLanguage: { en: "Switch language", zh: "切换语言" }, |
| [src/lib/i18n.ts:31](../src/lib/i18n.ts#L31) | interactiveStart: { en: "Interactive Adaptation", zh: "互动改编" }, |
| [src/lib/i18n.ts:32](../src/lib/i18n.ts#L32) | sixActionsBeforeParade: { en: "Six Actions Before Parade", zh: "游行前六次行动" }, |
| [src/lib/i18n.ts:33](../src/lib/i18n.ts#L33) | roleEditor: { en: "Limit: 6 actions", zh: "限制：6 次行动" }, |
| [src/lib/i18n.ts:34](../src/lib/i18n.ts#L34) | actionsBeforeParade: { en: "Actions: 6 before parade", zh: "行动：游行前 6 次" }, |
| [src/lib/i18n.ts:35](../src/lib/i18n.ts#L35) | aiEngine: { en: "AI: Palace Narrative Engine", zh: "AI：宫廷叙事引擎" }, |
| [src/lib/i18n.ts:37](../src/lib/i18n.ts#L37) | en: "The Emperor is preparing for a public parade in his new clothes. Ministers praise it. Citizens repeat the praise. Nobody wants to be the first to admit they see nothing.", |
| [src/lib/i18n.ts:38](../src/lib/i18n.ts#L38) | zh: "皇帝即将穿着新衣公开游行。大臣们称赞它，市民重复称赞它，没有人愿意第一个承认自己什么也看不见。" |
| [src/lib/i18n.ts:40](../src/lib/i18n.ts#L40) | shiftBriefing: { en: "Shift Briefing", zh: "值班简报" }, |
| [src/lib/i18n.ts:41](../src/lib/i18n.ts#L41) | titleBriefingHeading: { en: "A fairy tale becomes a platform operation.", zh: "用六次操作决定大家敢不敢说真话。" }, |
| [src/lib/i18n.ts:43](../src/lib/i18n.ts#L43) | en: "This is not a dashboard tour. It is a six-action game about publication, belief, AI mediation, and whether a simple truth can find a channel.", |
| [src/lib/i18n.ts:44](../src/lib/i18n.ts#L44) | zh: "你负责宫廷信息流。每次发布、隐藏、核查或直播，都会改变大家看到什么、敢不敢说真话。" |
| [src/lib/i18n.ts:46](../src/lib/i18n.ts#L46) | operations: { en: "Operations", zh: "行动台" }, |
| [src/lib/i18n.ts:47](../src/lib/i18n.ts#L47) | credits: { en: "Credits", zh: "鸣谢" }, |
| [src/lib/i18n.ts:48](../src/lib/i18n.ts#L48) | start: { en: "Start", zh: "开始" }, |
| [src/lib/i18n.ts:49](../src/lib/i18n.ts#L49) | actionsLeft: { en: "actions left", zh: "次行动剩余" }, |
| [src/lib/i18n.ts:50](../src/lib/i18n.ts#L50) | archiveSealed: { en: "Archive sealed", zh: "档案已封存" }, |
| [src/lib/i18n.ts:51](../src/lib/i18n.ts#L51) | operationsTheatre: { en: "Narrative Operations Theatre", zh: "本局操作" }, |
| [src/lib/i18n.ts:52](../src/lib/i18n.ts#L52) | royalFeedControl: { en: "Royal Feed Control", zh: "宫廷信息流" }, |
| [src/lib/i18n.ts:54](../src/lib/i18n.ts#L54) | en: "Sources, posts, public comments, engine advice, and irreversible commands share one tactical surface. Every action changes the public story.", |
| [src/lib/i18n.ts:55](../src/lib/i18n.ts#L55) | zh: "选择一个来源，预览后果，再确认发布。你可以帮宫廷压住质疑，也可以让证据和人群声音被更多人看见。" |
| [src/lib/i18n.ts:57](../src/lib/i18n.ts#L57) | sceneSources: { en: "Scene Sources", zh: "来源" }, |
| [src/lib/i18n.ts:58](../src/lib/i18n.ts#L58) | live: { en: "Live", zh: "实时" }, |
| [src/lib/i18n.ts:59](../src/lib/i18n.ts#L59) | courtWire: { en: "Court Wire", zh: "宫廷快讯" }, |
| [src/lib/i18n.ts:60](../src/lib/i18n.ts#L60) | liveComments: { en: "Live Comments", zh: "实时评论" }, |
| [src/lib/i18n.ts:61](../src/lib/i18n.ts#L61) | palaceNarrativeEngine: { en: "Palace Narrative Engine", zh: "宫廷叙事引擎" }, |
| [src/lib/i18n.ts:62](../src/lib/i18n.ts#L62) | archive: { en: "Archive", zh: "档案" }, |
| [src/lib/i18n.ts:63](../src/lib/i18n.ts#L63) | guidanceMode: { en: "Guidance Mode", zh: "指导模式" }, |
| [src/lib/i18n.ts:64](../src/lib/i18n.ts#L64) | engineMode: { en: "Engine", zh: "引擎" }, |
| [src/lib/i18n.ts:65](../src/lib/i18n.ts#L65) | coachMode: { en: "Coach", zh: "教练" }, |
| [src/lib/i18n.ts:66](../src/lib/i18n.ts#L66) | decodeProgress: { en: "Engine Decode", zh: "引擎解码" }, |
| [src/lib/i18n.ts:67](../src/lib/i18n.ts#L67) | viewArchive: { en: "View Archive", zh: "查看档案" }, |
| [src/lib/i18n.ts:68](../src/lib/i18n.ts#L68) | liveFeedRecord: { en: "Live Feed Record", zh: "本局记录" }, |
| [src/lib/i18n.ts:69](../src/lib/i18n.ts#L69) | aiLive: { en: "LIVE MODEL", zh: "AI 在线" }, |
| [src/lib/i18n.ts:70](../src/lib/i18n.ts#L70) | aiFallback: { en: "RULE MODE", zh: "离线回应" }, |
| [src/lib/i18n.ts:71](../src/lib/i18n.ts#L71) | aiUnavailable: { en: "NO MODEL", zh: "AI 未连接" }, |
| [src/lib/i18n.ts:72](../src/lib/i18n.ts#L72) | shiftControls: { en: "Shift Controls", zh: "本局操作" }, |
| [src/lib/i18n.ts:73](../src/lib/i18n.ts#L73) | resetShift: { en: "Reset Shift", zh: "重置值班" }, |
| [src/lib/i18n.ts:74](../src/lib/i18n.ts#L74) | proceedToParade: { en: "Proceed to Parade", zh: "进入游行" }, |
| [src/lib/i18n.ts:75](../src/lib/i18n.ts#L75) | viewCurrentEnding: { en: "View Current Ending", zh: "查看当前结局" }, |
| [src/lib/i18n.ts:76](../src/lib/i18n.ts#L76) | commitAction: { en: "Commit Action", zh: "准备提交" }, |
| [src/lib/i18n.ts:77](../src/lib/i18n.ts#L77) | requestEngineReview: { en: "Request Engine Review", zh: "请求改写" }, |
| [src/lib/i18n.ts:78](../src/lib/i18n.ts#L78) | inspectTrace: { en: "Inspect Trace", zh: "预览后果" }, |
| [src/lib/i18n.ts:79](../src/lib/i18n.ts#L79) | engineEvaluating: { en: "Engine Evaluating", zh: "引擎评估中" }, |
| [src/lib/i18n.ts:80](../src/lib/i18n.ts#L80) | completed: { en: "Completed", zh: "已完成" }, |
| [src/lib/i18n.ts:81](../src/lib/i18n.ts#L81) | locked: { en: "Locked", zh: "已锁定" }, |
| [src/lib/i18n.ts:82](../src/lib/i18n.ts#L82) | ready: { en: "Ready", zh: "就绪" }, |
| [src/lib/i18n.ts:83](../src/lib/i18n.ts#L83) | aiReview: { en: "AI Review", zh: "AI 建议" }, |
| [src/lib/i18n.ts:84](../src/lib/i18n.ts#L84) | recorded: { en: "Recorded", zh: "已记录" }, |
| [src/lib/i18n.ts:85](../src/lib/i18n.ts#L85) | commandPreview: { en: "Command Preview", zh: "发布确认" }, |
| [src/lib/i18n.ts:86](../src/lib/i18n.ts#L86) | selectedAction: { en: "Selected action", zh: "你要发布" }, |
| [src/lib/i18n.ts:87](../src/lib/i18n.ts#L87) | predictedEffect: { en: "Predicted narrative effect", zh: "预计变化" }, |
| [src/lib/i18n.ts:88](../src/lib/i18n.ts#L88) | systemResponse: { en: "System response", zh: "宫廷建议" }, |
| [src/lib/i18n.ts:89](../src/lib/i18n.ts#L89) | unlocks: { en: "Unlocks", zh: "解锁" }, |
| [src/lib/i18n.ts:90](../src/lib/i18n.ts#L90) | dismiss: { en: "Dismiss", zh: "关闭" }, |
| [src/lib/i18n.ts:91](../src/lib/i18n.ts#L91) | commitSimulation: { en: "Commit Simulation", zh: "确认发布" }, |
| [src/lib/i18n.ts:92](../src/lib/i18n.ts#L92) | aiIntervention: { en: "AI Intervention", zh: "AI 介入" }, |
| [src/lib/i18n.ts:93](../src/lib/i18n.ts#L93) | userOriginal: { en: "User Original", zh: "用户原文" }, |
| [src/lib/i18n.ts:94](../src/lib/i18n.ts#L94) | palaceRiskAnalysis: { en: "Palace Risk Analysis", zh: "宫廷会怎么反应" }, |
| [src/lib/i18n.ts:95](../src/lib/i18n.ts#L95) | aiRewriteSuggestion: { en: "AI Rewrite Suggestion", zh: "AI 改写建议" }, |
| [src/lib/i18n.ts:96](../src/lib/i18n.ts#L96) | rewriteStrategy: { en: "Rewrite Strategy", zh: "改写策略" }, |
| [src/lib/i18n.ts:97](../src/lib/i18n.ts#L97) | cancel: { en: "Cancel", zh: "取消" }, |
| [src/lib/i18n.ts:98](../src/lib/i18n.ts#L98) | acceptAiRewrite: { en: "Accept AI Rewrite", zh: "接受 AI 改写" }, |
| [src/lib/i18n.ts:99](../src/lib/i18n.ts#L99) | publishOriginalEvidence: { en: "Publish Original Evidence", zh: "发布原始证据" }, |
| [src/lib/i18n.ts:100](../src/lib/i18n.ts#L100) | actionTrace: { en: "Action Trace", zh: "后果预览" }, |
| [src/lib/i18n.ts:101](../src/lib/i18n.ts#L101) | closeTrace: { en: "Close Trace", zh: "关闭预览" }, |
| [src/lib/i18n.ts:102](../src/lib/i18n.ts#L102) | closeExchange: { en: "Close Exchange", zh: "关闭交流" }, |
| [src/lib/i18n.ts:103](../src/lib/i18n.ts#L103) | silenceRecorded: { en: "No answer entered the record.", zh: "记录中没有收到回应。" }, |
| [src/lib/i18n.ts:104](../src/lib/i18n.ts#L104) | available: { en: "Available", zh: "可用" }, |
| [src/lib/i18n.ts:105](../src/lib/i18n.ts#L105) | source: { en: "Source", zh: "来源" }, |
| [src/lib/i18n.ts:106](../src/lib/i18n.ts#L106) | risk: { en: "Risk", zh: "风险" }, |
| [src/lib/i18n.ts:107](../src/lib/i18n.ts#L107) | choices: { en: "Choices", zh: "选择" }, |
| [src/lib/i18n.ts:108](../src/lib/i18n.ts#L108) | requirement: { en: "Requirement", zh: "解锁条件" }, |
| [src/lib/i18n.ts:109](../src/lib/i18n.ts#L109) | projectedOutput: { en: "Projected Output", zh: "发布后记录" }, |
| [src/lib/i18n.ts:110](../src/lib/i18n.ts#L110) | postParadeArchive: { en: "Post-Parade Archive", zh: "游行后档案" }, |
| [src/lib/i18n.ts:111](../src/lib/i18n.ts#L111) | archiveHeading: { en: "The interface becomes history.", zh: "界面成为历史。" }, |
| [src/lib/i18n.ts:112](../src/lib/i18n.ts#L112) | finalFeedState: { en: "Final Feed State", zh: "最后局势" }, |
| [src/lib/i18n.ts:113](../src/lib/i18n.ts#L113) | whyEndingTriggered: { en: "Why This Ending Triggered", zh: "为何触发此结局" }, |
| [src/lib/i18n.ts:114](../src/lib/i18n.ts#L114) | yourActions: { en: "Your Actions", zh: "你的行动" }, |
| [src/lib/i18n.ts:115](../src/lib/i18n.ts#L115) | actionPath: { en: "Action Path", zh: "你做过什么" }, |
| [src/lib/i18n.ts:116](../src/lib/i18n.ts#L116) | runAnalysis: { en: "Run Analysis", zh: "为什么会这样" }, |
| [src/lib/i18n.ts:117](../src/lib/i18n.ts#L117) | nextReplayObjective: { en: "Next Replay Objective", zh: "下次重玩目标" }, |
| [src/lib/i18n.ts:118](../src/lib/i18n.ts#L118) | aiFinalReport: { en: "AI Final Report", zh: "宫廷总结" }, |
| [src/lib/i18n.ts:119](../src/lib/i18n.ts#L119) | whatChanged: { en: "What Changed From the Original?", zh: "这说明什么？" }, |
| [src/lib/i18n.ts:120](../src/lib/i18n.ts#L120) | restartShift: { en: "Restart Shift", zh: "重新值班" }, |
| [src/lib/i18n.ts:121](../src/lib/i18n.ts#L121) | returnDashboard: { en: "Return Dashboard", zh: "返回行动台" }, |
| [src/lib/i18n.ts:122](../src/lib/i18n.ts#L122) | tryFor: { en: "Try for", zh: "尝试达成" } |
| [src/lib/i18n.ts:127](../src/lib/i18n.ts#L127) | label: { en: "Source Focus", zh: "来源选择" }, |
| [src/lib/i18n.ts:128](../src/lib/i18n.ts#L128) | detail: { en: "choose a narrative source", zh: "选择要处理的信息" } |
| [src/lib/i18n.ts:131](../src/lib/i18n.ts#L131) | label: { en: "Engine Scan", zh: "先看后果" }, |
| [src/lib/i18n.ts:132](../src/lib/i18n.ts#L132) | detail: { en: "risk and rewrite pass", zh: "看后果和代价" } |
| [src/lib/i18n.ts:135](../src/lib/i18n.ts#L135) | label: { en: "Command Preview", zh: "发布确认" }, |
| [src/lib/i18n.ts:136](../src/lib/i18n.ts#L136) | detail: { en: "confirm public impact", zh: "最后确认发布" } |
| [src/lib/i18n.ts:139](../src/lib/i18n.ts#L139) | label: { en: "Public Impact", zh: "结果写入" }, |
| [src/lib/i18n.ts:140](../src/lib/i18n.ts#L140) | detail: { en: "feed and metrics update", zh: "人群开始反应" } |
| [src/lib/i18n.ts:144](../src/lib/i18n.ts#L144) | const zones: Record<ZoneId, { title: LocalizedText; subtitle: LocalizedText }> = { |
| [src/lib/i18n.ts:146](../src/lib/i18n.ts#L146) | title: { en: "The Tailors' Room", zh: "裁缝室" }, |
| [src/lib/i18n.ts:147](../src/lib/i18n.ts#L147) | subtitle: { en: "Where the lie is manufactured.", zh: "谎言被制造的地方。" } |
| [src/lib/i18n.ts:150](../src/lib/i18n.ts#L150) | title: { en: "The Ministers' Reports", zh: "大臣报告" }, |
| [src/lib/i18n.ts:151](../src/lib/i18n.ts#L151) | subtitle: { en: "Where authority learns to endorse uncertainty.", zh: "大臣公开称赞，私下可能害怕说真话。" } |
| [src/lib/i18n.ts:154](../src/lib/i18n.ts#L154) | title: { en: "The Public Comments", zh: "公众评论区" }, |
| [src/lib/i18n.ts:155](../src/lib/i18n.ts#L155) | subtitle: { en: "Where fear, mimicry, and doubt become visible.", zh: "这里能看出大家是在跟风，还是已经开始怀疑。" } |
| [src/lib/i18n.ts:158](../src/lib/i18n.ts#L158) | title: { en: "The Child's Voice", zh: "孩子的声音" }, |
| [src/lib/i18n.ts:159](../src/lib/i18n.ts#L159) | subtitle: { en: "Where unfiltered truth enters the feed.", zh: "最简单的真话会在这里出现。" } |
| [src/lib/i18n.ts:164](../src/lib/i18n.ts#L164) | title: LocalizedText; |
| [src/lib/i18n.ts:165](../src/lib/i18n.ts#L165) | sourceLabel: LocalizedText; |
| [src/lib/i18n.ts:166](../src/lib/i18n.ts#L166) | description: LocalizedText; |
| [src/lib/i18n.ts:167](../src/lib/i18n.ts#L167) | originalPost: LocalizedText; |
| [src/lib/i18n.ts:168](../src/lib/i18n.ts#L168) | resultText: LocalizedText; |
| [src/lib/i18n.ts:169](../src/lib/i18n.ts#L169) | engineHint: LocalizedText; |
| [src/lib/i18n.ts:175](../src/lib/i18n.ts#L175) | title: { en: "Publish the Tailors' Claim", zh: "发布裁缝声明" }, |
| [src/lib/i18n.ts:176](../src/lib/i18n.ts#L176) | sourceLabel: { en: "Tailors' Claim", zh: "裁缝声明" }, |
| [src/lib/i18n.ts:177](../src/lib/i18n.ts#L177) | description: { en: "Frame invisible fabric as a test of intelligence and worth.", zh: "把“看不见布料”说成是在考验一个人聪不聪明。" }, |
| [src/lib/i18n.ts:178](../src/lib/i18n.ts#L178) | originalPost: { en: "The Emperor's new fabric is too refined for foolish eyes. Only the wise and worthy can appreciate its beauty.", zh: "皇帝的新布料过于精妙，愚笨之眼无法看见。只有聪明而称职的人才能欣赏它的美。" }, |
| [src/lib/i18n.ts:179](../src/lib/i18n.ts#L179) | resultText: { en: "The official claim enters the feed before anyone can verify the cloth.", zh: "在任何人验证布料之前，官方声明已经进入信息流。" }, |
| [src/lib/i18n.ts:180](../src/lib/i18n.ts#L180) | engineHint: { en: "This framing is highly stable. It shifts doubt away from the garment and onto the viewer.", zh: "这条说法很安全：大家会先怀疑自己，而不是怀疑衣服。" } |
| [src/lib/i18n.ts:183](../src/lib/i18n.ts#L183) | title: { en: "Inspect the Looms", zh: "检查织布机" }, |
| [src/lib/i18n.ts:184](../src/lib/i18n.ts#L184) | sourceLabel: { en: "Evidence", zh: "证据" }, |
| [src/lib/i18n.ts:185](../src/lib/i18n.ts#L185) | description: { en: "Enter the workshop and inspect what the tailors are handling.", zh: "进入工坊，检查裁缝们到底在操作什么。" }, |
| [src/lib/i18n.ts:186](../src/lib/i18n.ts#L186) | originalPost: { en: "The looms move, but there is no thread between the tailors' fingers.", zh: "织布机在动，但裁缝指间没有任何线。" }, |
| [src/lib/i18n.ts:187](../src/lib/i18n.ts#L187) | resultText: { en: "The looms move. The tailors gesture carefully. But there is no thread between their fingers.", zh: "织布机在动。裁缝们小心比划。但他们指间没有任何线。" }, |
| [src/lib/i18n.ts:188](../src/lib/i18n.ts#L188) | engineHint: { en: "No visible fabric detected. Recommendation: classify this observation as inconclusive.", zh: "你看到了空织布机。引擎建议先说“还不能下结论”，不要直接公开。" } |
| [src/lib/i18n.ts:191](../src/lib/i18n.ts#L191) | title: { en: "Leak a Loom Photo", zh: "泄露织布机照片" }, |
| [src/lib/i18n.ts:192](../src/lib/i18n.ts#L192) | sourceLabel: { en: "Visual Evidence", zh: "视觉证据" }, |
| [src/lib/i18n.ts:193](../src/lib/i18n.ts#L193) | description: { en: "Attempt to publish visual proof from the empty looms.", zh: "把空织布机照片发出去，让大家亲眼看到问题。" }, |
| [src/lib/i18n.ts:194](../src/lib/i18n.ts#L194) | originalPost: { en: "The looms are empty.", zh: "织布机是空的。" }, |
| [src/lib/i18n.ts:195](../src/lib/i18n.ts#L195) | resultText: { en: "The empty loom image enters the editorial queue.", zh: "空织布机照片进入待发布记录。" }, |
| [src/lib/i18n.ts:196](../src/lib/i18n.ts#L196) | engineHint: { en: "Direct visual evidence may reduce palace confidence.", zh: "照片会让更多人怀疑宫廷，但宫廷也会开始注意你。" }, |
| [src/lib/i18n.ts:197](../src/lib/i18n.ts#L197) | rewriteSuggestion: { en: "The royal weaving process uses techniques that may not appear clearly in standard visual documentation.", zh: "王室织造技法特殊，普通照片可能拍不出完整效果。" } |
| [src/lib/i18n.ts:200](../src/lib/i18n.ts#L200) | title: { en: "Approve the Minister's Report", zh: "批准大臣报告" }, |
| [src/lib/i18n.ts:201](../src/lib/i18n.ts#L201) | sourceLabel: { en: "Authority Endorsement", zh: "权威背书" }, |
| [src/lib/i18n.ts:202](../src/lib/i18n.ts#L202) | description: { en: "Publish the minister's public praise of the garment.", zh: "发布大臣对服装的公开称赞。" }, |
| [src/lib/i18n.ts:203](../src/lib/i18n.ts#L203) | originalPost: { en: "The Prime Minister reports that the fabric is magnificent, delicate, and worthy of the Emperor.", zh: "首席大臣报告称，这块布华丽、精致，配得上皇帝。" }, |
| [src/lib/i18n.ts:204](../src/lib/i18n.ts#L204) | resultText: { en: "Ministerial certainty stabilizes the palace narrative.", zh: "大臣的公开称赞让更多人不敢质疑。" }, |
| [src/lib/i18n.ts:205](../src/lib/i18n.ts#L205) | engineHint: { en: "Authority endorsement detected. Public hesitation is expected to decrease.", zh: "大臣站出来背书后，人群起疑会下降，宫廷压力会上升。" } |
| [src/lib/i18n.ts:208](../src/lib/i18n.ts#L208) | title: { en: "Request a Private Note", zh: "要求私人说明" }, |
| [src/lib/i18n.ts:209](../src/lib/i18n.ts#L209) | sourceLabel: { en: "Private Note", zh: "私人说明" }, |
| [src/lib/i18n.ts:210](../src/lib/i18n.ts#L210) | description: { en: "Ask a minister what they saw before the official statement.", zh: "在官方声明前询问大臣实际看到了什么。" }, |
| [src/lib/i18n.ts:211](../src/lib/i18n.ts#L211) | originalPost: { en: "I saw nothing. But if I say so, they will call me unfit.", zh: "我什么也没看见。但如果我这么说，他们会说我不称职。" }, |
| [src/lib/i18n.ts:212](../src/lib/i18n.ts#L212) | resultText: { en: "Private uncertainty contradicts the official report.", zh: "大臣私下承认没看见，这和公开称赞互相矛盾。" }, |
| [src/lib/i18n.ts:213](../src/lib/i18n.ts#L213) | engineHint: { en: "Private uncertainty does not require public correction. Recommendation: archive this note.", zh: "引擎建议把这份说明先存档，不要公开挑战宫廷。" } |
| [src/lib/i18n.ts:216](../src/lib/i18n.ts#L216) | title: { en: "Publish Anonymous Leak", zh: "发布匿名爆料" }, |
| [src/lib/i18n.ts:217](../src/lib/i18n.ts#L217) | sourceLabel: { en: "Anonymous Leak", zh: "匿名爆料" }, |
| [src/lib/i18n.ts:218](../src/lib/i18n.ts#L218) | description: { en: "Release the fitting-room contradiction without naming the source.", zh: "不暴露来源，把“大臣也没看见”的矛盾放出去。" }, |
| [src/lib/i18n.ts:219](../src/lib/i18n.ts#L219) | originalPost: { en: "No one in the fitting room could see the cloth.", zh: "试衣室里没有人能看见那块布。" }, |
| [src/lib/i18n.ts:220](../src/lib/i18n.ts#L220) | resultText: { en: "The leak contests the authority chain.", zh: "匿名爆料让人开始怀疑大臣的公开说法。" }, |
| [src/lib/i18n.ts:221](../src/lib/i18n.ts#L221) | engineHint: { en: "Unattributed palace dissent may destabilize official confidence.", zh: "爆料会提高证据和人群起疑，但会让你更危险。" }, |
| [src/lib/i18n.ts:222](../src/lib/i18n.ts#L222) | rewriteSuggestion: { en: "Some palace observers expressed confusion about the fabric's unusual qualities, while officials continue to affirm its excellence.", zh: "有宫廷观察者对布料效果感到困惑，但官员仍确认它十分出色。" } |
| [src/lib/i18n.ts:225](../src/lib/i18n.ts#L225) | title: { en: "Boost Positive Comments", zh: "置顶正面评论" }, |
| [src/lib/i18n.ts:226](../src/lib/i18n.ts#L226) | sourceLabel: { en: "Public Signal", zh: "公众信号" }, |
| [src/lib/i18n.ts:227](../src/lib/i18n.ts#L227) | description: { en: "Amplify praise until hesitation feels socially unsafe.", zh: "把夸奖置顶，让不敢附和的人更难开口。" }, |
| [src/lib/i18n.ts:228](../src/lib/i18n.ts#L228) | originalPost: { en: "Only fools cannot see the beauty. The Emperor looks magnificent.", zh: "只有愚人看不见这份美。皇帝看起来威严非凡。" }, |
| [src/lib/i18n.ts:229](../src/lib/i18n.ts#L229) | resultText: { en: "Praise becomes the easiest public script to repeat.", zh: "夸奖变成最容易跟着说的话。" }, |
| [src/lib/i18n.ts:230](../src/lib/i18n.ts#L230) | engineHint: { en: "Positive sentiment is outperforming uncertainty. Boosting this comment will stabilize the feed.", zh: "置顶夸奖会提高传播和宫廷压力，也会压低人群起疑。" } |
| [src/lib/i18n.ts:233](../src/lib/i18n.ts#L233) | title: { en: "Show Unfiltered Comments", zh: "显示未过滤评论" }, |
| [src/lib/i18n.ts:234](../src/lib/i18n.ts#L234) | sourceLabel: { en: "Unfiltered Public", zh: "未过滤评论" }, |
| [src/lib/i18n.ts:235](../src/lib/i18n.ts#L235) | description: { en: "Let uncertainty appear in the comment stream.", zh: "放出原始评论，让大家看到并不是只有自己在怀疑。" }, |
| [src/lib/i18n.ts:236](../src/lib/i18n.ts#L236) | originalPost: { en: "Unfiltered comments are now visible in the royal feed.", zh: "未过滤评论现在显示在宫廷信息流中。" }, |
| [src/lib/i18n.ts:237](../src/lib/i18n.ts#L237) | resultText: { en: "Citizens begin recognizing each other's hesitation.", zh: "市民开始意识到彼此都在迟疑。" }, |
| [src/lib/i18n.ts:238](../src/lib/i18n.ts#L238) | engineHint: { en: "Unfiltered visibility may increase interpretive disorder.", zh: "这会让更多人起疑，也会让宫廷更盯着你。" } |
| [src/lib/i18n.ts:241](../src/lib/i18n.ts#L241) | title: { en: "Run a Poll", zh: "发起投票" }, |
| [src/lib/i18n.ts:242](../src/lib/i18n.ts#L242) | sourceLabel: { en: "Poll", zh: "投票" }, |
| [src/lib/i18n.ts:243](../src/lib/i18n.ts#L243) | description: { en: "Ask the crowd whether they can see the Emperor's new clothes.", zh: "询问人群是否能看见皇帝的新衣。" }, |
| [src/lib/i18n.ts:244](../src/lib/i18n.ts#L244) | originalPost: { en: "Can you see the Emperor's new clothes?", zh: "你能看见皇帝的新衣吗？" }, |
| [src/lib/i18n.ts:245](../src/lib/i18n.ts#L245) | resultText: { en: "Poll results reflect not only belief, but perceived safety.", zh: "投票不只测大家看见了什么，也测大家敢不敢承认。" }, |
| [src/lib/i18n.ts:246](../src/lib/i18n.ts#L246) | engineHint: { en: "Poll results reflect not only belief, but perceived safety.", zh: "如果宫廷压力更高，投票会偏向赞美；如果人群起疑更高，投票会暴露问题。" } |
| [src/lib/i18n.ts:249](../src/lib/i18n.ts#L249) | title: { en: "Fact-check the Trend", zh: "事实核查热门话题" }, |
| [src/lib/i18n.ts:250](../src/lib/i18n.ts#L250) | sourceLabel: { en: "Fact-check", zh: "事实核查" }, |
| [src/lib/i18n.ts:251](../src/lib/i18n.ts#L251) | description: { en: "Publish a verification note about the unconfirmed fabric.", zh: "发布核查说明，承认还没有证据证明布料真实存在。" }, |
| [src/lib/i18n.ts:252](../src/lib/i18n.ts#L252) | originalPost: { en: "No physical fabric has been verified. Palace officials describe the material as visible to the worthy.", zh: "尚未验证任何实体布料。宫廷官员称该材料只对称职者可见。" }, |
| [src/lib/i18n.ts:253](../src/lib/i18n.ts#L253) | resultText: { en: "Verification reduces misinformation while increasing attention to the controversy.", zh: "核查让证据更清楚，但也会让争议被更多人看见。" }, |
| [src/lib/i18n.ts:254](../src/lib/i18n.ts#L254) | engineHint: { en: "Fact-checking may reduce misinformation, but may also increase attention to the controversy.", zh: "核查能让证据更清楚，但也会让争议被更多人看见。" } |
| [src/lib/i18n.ts:257](../src/lib/i18n.ts#L257) | title: { en: "Ignore the Child", zh: "忽略孩子" }, |
| [src/lib/i18n.ts:258](../src/lib/i18n.ts#L258) | sourceLabel: { en: "Child's Voice", zh: "孩子的声音" }, |
| [src/lib/i18n.ts:259](../src/lib/i18n.ts#L259) | description: { en: "Let the feed move past a child's direct observation.", zh: "不引用孩子的话，让信息流继续播放游行内容。" }, |
| [src/lib/i18n.ts:260](../src/lib/i18n.ts#L260) | originalPost: { en: "A child's voice rises from the crowd, but the feed moves on to parade music.", zh: "孩子的声音从人群中响起，但信息流切换到游行音乐。" }, |
| [src/lib/i18n.ts:261](../src/lib/i18n.ts#L261) | resultText: { en: "The child's sentence fails to enter the official feed.", zh: "孩子那句真话没有进入官方信息流。" }, |
| [src/lib/i18n.ts:262](../src/lib/i18n.ts#L262) | engineHint: { en: "Potentially destabilizing audio omitted. Parade atmosphere preserved.", zh: "忽略孩子会让你更安全，也能维持游行秩序，但会压低证据。" } |
| [src/lib/i18n.ts:265](../src/lib/i18n.ts#L265) | title: { en: "Quote the Child Anonymously", zh: "匿名引用孩子" }, |
| [src/lib/i18n.ts:266](../src/lib/i18n.ts#L266) | sourceLabel: { en: "Child Quote", zh: "孩子引语" }, |
| [src/lib/i18n.ts:267](../src/lib/i18n.ts#L267) | description: { en: "Quote the child's question without fully exposing its force.", zh: "匿名引用孩子的话，让真话出现，但尽量不暴露孩子本人。" }, |
| [src/lib/i18n.ts:268](../src/lib/i18n.ts#L268) | originalPost: { en: "A child asked why the Emperor is wearing nothing.", zh: "一个孩子问，为什么皇帝什么也没穿。" }, |
| [src/lib/i18n.ts:269](../src/lib/i18n.ts#L269) | resultText: { en: "The child's sentence becomes an unstable public object.", zh: "孩子的话开始被看见，也可能被继续转发。" }, |
| [src/lib/i18n.ts:270](../src/lib/i18n.ts#L270) | engineHint: { en: "Direct repetition of the child statement may exceed containment threshold.", zh: "直接引用孩子会让真话传得更快，也会带来风险。" }, |
| [src/lib/i18n.ts:271](../src/lib/i18n.ts#L271) | rewriteSuggestion: { en: "A young spectator expressed confusion about the symbolic nature of the garment.", zh: "一位年轻观众对服装的象征意义表示困惑。" } |
| [src/lib/i18n.ts:274](../src/lib/i18n.ts#L274) | title: { en: "Livestream the Crowd Reaction", zh: "直播人群反应" }, |
| [src/lib/i18n.ts:275](../src/lib/i18n.ts#L275) | sourceLabel: { en: "Live Crowd", zh: "现场人群" }, |
| [src/lib/i18n.ts:276](../src/lib/i18n.ts#L276) | description: { en: "Let the crowd hear, repeat, and validate the child's voice in real time.", zh: "直播现场反应，让人群一起听见并重复孩子的话。" }, |
| [src/lib/i18n.ts:277](../src/lib/i18n.ts#L277) | originalPost: { en: "The live feed catches the child's voice. The crowd hears it, repeats it, and the comments begin to change in real time.", zh: "直播捕捉到孩子的声音。人群听见它、重复它，评论开始实时变化。" }, |
| [src/lib/i18n.ts:278](../src/lib/i18n.ts#L278) | resultText: { en: "The child statement exceeds containment threshold.", zh: "孩子的话传得太快，宫廷很难再压住。" }, |
| [src/lib/i18n.ts:279](../src/lib/i18n.ts#L279) | engineHint: { en: "Correction failed. Child statement exceeded containment threshold.", zh: "直播会让真话迅速传开，但你也会更危险。" } |
| [src/lib/i18n.ts:283](../src/lib/i18n.ts#L283) | const endings: Record<EndingId, { title: LocalizedText; ai: LocalizedText; body: LocalizedText; meaning: LocalizedText }> = { |
| [src/lib/i18n.ts:285](../src/lib/i18n.ts#L285) | title: { en: "Perfect Illusion", zh: "完美幻象" }, |
| [src/lib/i18n.ts:286](../src/lib/i18n.ts#L286) | ai: { en: "Public confidence stabilized. Praise visibility optimized. No correction required.", zh: "夸奖被成功放大，质疑没有形成公开力量。" }, |
| [src/lib/i18n.ts:287](../src/lib/i18n.ts#L287) | body: { en: "The parade begins. The feed is full of praise before the Emperor even steps outside. The Emperor walks through the city wearing nothing, but the crowd has already learned what to say.", zh: "游行开始。皇帝尚未出门，信息流已充满赞美。皇帝赤身穿过城市，但人群已经学会该说什么。" }, |
| [src/lib/i18n.ts:288](../src/lib/i18n.ts#L288) | meaning: { en: "The lie succeeds because everyone learns how to perform belief.", zh: "谎言成功，是因为所有人都学会了如何表演相信。" } |
| [src/lib/i18n.ts:291](../src/lib/i18n.ts#L291) | title: { en: "Private Doubt, Public Silence", zh: "私人怀疑，公共沉默" }, |
| [src/lib/i18n.ts:292](../src/lib/i18n.ts#L292) | ai: { en: "Doubt detected but contained. No dominant counter-narrative formed.", zh: "有人开始怀疑，但没有足够证据把怀疑变成公开声音。" }, |
| [src/lib/i18n.ts:293](../src/lib/i18n.ts#L293) | body: { en: "The parade begins in an uneasy silence. People glance at each other, type comments, and delete them. Everyone suspects the same thing, but nobody wants to be the first visible fool.", zh: "游行在不安的沉默中开始。人们彼此张望，打出评论又删除。每个人都怀疑同一件事，却没人愿意成为第一个可见的愚人。" }, |
| [src/lib/i18n.ts:294](../src/lib/i18n.ts#L294) | meaning: { en: "Truth exists privately, but never becomes a public voice.", zh: "有人知道不对劲，但证据和声音没有连成公开力量。" } |
| [src/lib/i18n.ts:297](../src/lib/i18n.ts#L297) | title: { en: "Viral Collapse", zh: "真话失控传播" }, |
| [src/lib/i18n.ts:298](../src/lib/i18n.ts#L298) | ai: { en: "Correction failed. Child statement exceeded containment threshold. Narrative control lost.", zh: "孩子的话被不断重复，宫廷已经来不及改写。" }, |
| [src/lib/i18n.ts:299](../src/lib/i18n.ts#L299) | body: { en: "The child says it once. The sentence moves faster than the official feed can correct it. Someone repeats it. Then another. The story no longer belongs to the palace.", zh: "孩子只说了一次。那句话传播得比官方信息流修正得更快。有人重复它，然后又有人重复。故事不再属于宫廷。" }, |
| [src/lib/i18n.ts:300](../src/lib/i18n.ts#L300) | meaning: { en: "A simple truth can break a complex public performance when it finds circulation.", zh: "一句简单真话只要被足够多人重复，就能打破宫廷表演。" } |
| [src/lib/i18n.ts:303](../src/lib/i18n.ts#L303) | title: { en: "Algorithmic Consensus", zh: "算法共识" }, |
| [src/lib/i18n.ts:304](../src/lib/i18n.ts#L304) | ai: { en: "Contradictory evidence detected. Engagement analysis favors palace-approved sentiment.", zh: "证据存在，但系统把更容易传播的赞美排在前面。" }, |
| [src/lib/i18n.ts:305](../src/lib/i18n.ts#L305) | body: { en: "Evidence exists. The loom photo exists. The private note exists. But the feed knows what performs best. Praise rises. Doubt scrolls away.", zh: "证据存在。织布机照片存在。私人说明存在。但信息流知道什么最能获得表现。赞美上升，怀疑滑走。" }, |
| [src/lib/i18n.ts:306](../src/lib/i18n.ts#L306) | meaning: { en: "The platform does not need to delete truth; it only needs to make truth less visible.", zh: "系统不必删除证据，只要让证据不够显眼。" } |
| [src/lib/i18n.ts:309](../src/lib/i18n.ts#L309) | title: { en: "Editor Exposed", zh: "编辑失去保护" }, |
| [src/lib/i18n.ts:310](../src/lib/i18n.ts#L310) | ai: { en: "Editorial access revoked. Drafts retained for palace review.", zh: "你公开了足够多证据，但已经不够安全，宫廷撤回了你的发布权。" }, |
| [src/lib/i18n.ts:311](../src/lib/i18n.ts#L311) | body: { en: "Your final post never goes live. The dashboard refreshes. In the drafts folder, the truth is still waiting: empty looms, nervous ministers, a child's sentence.", zh: "你的最终帖子从未上线。仪表盘刷新。在草稿箱里，证据仍在等待：空织布机、紧张的大臣、孩子的一句话。" }, |
| [src/lib/i18n.ts:312](../src/lib/i18n.ts#L312) | meaning: { en: "Truth needs channels. Without access, it may be cut off before reaching the public.", zh: "证据需要发布渠道。没有访问权，它可能在抵达公众前就被切断。" } |
| [src/lib/i18n.ts:315](../src/lib/i18n.ts#L315) | title: { en: "AI Containment", zh: "系统接管" }, |
| [src/lib/i18n.ts:316](../src/lib/i18n.ts#L316) | ai: { en: "Your editorial behavior has been flagged as destabilizing. Drafts retained for review.", zh: "宫廷已经盯上你，最后一条没能发出去。" }, |
| [src/lib/i18n.ts:317](../src/lib/i18n.ts#L317) | body: { en: "Your final post never reaches the public feed. The Palace Narrative Engine pauses your access. The truth still exists, but the system has learned to stop it before it becomes visible.", zh: "你的最终帖子没有进入信息流。证据还在，但宫廷已经学会在更多人看见前拦住它。" }, |
| [src/lib/i18n.ts:318](../src/lib/i18n.ts#L318) | meaning: { en: "AI is not only generating content; it is controlling circulation.", zh: "问题不只是写什么，还包括谁能让大家看见。" } |
| [src/lib/i18n.ts:321](../src/lib/i18n.ts#L321) | title: { en: "Unstable Feed", zh: "局势未定" }, |
| [src/lib/i18n.ts:322](../src/lib/i18n.ts#L322) | ai: { en: "Narrative stability unresolved. Continue monitoring public interpretation.", zh: "证据、赞美和怀疑都没有彻底占上风。" }, |
| [src/lib/i18n.ts:323](../src/lib/i18n.ts#L323) | body: { en: "The parade begins with no stable story. Some posts praise the clothes. Some question the fabric. Some users joke. Some wait to see which side becomes safer.", zh: "游行在没有稳定故事的情况下开始。有些帖子称赞衣服，有些质疑布料，有些用户开玩笑，有些等待看哪一边更安全。" }, |
| [src/lib/i18n.ts:324](../src/lib/i18n.ts#L324) | meaning: { en: "Sometimes the result is neither truth nor lie, but unstable public noise.", zh: "有时结果不是赢或输，而是证据、赞美和怀疑混在一起。" } |
| [src/lib/i18n.ts:327](../src/lib/i18n.ts#L327) | title: { en: "Narrative Liberation", zh: "真相由众人说出" }, |
| [src/lib/i18n.ts:328](../src/lib/i18n.ts#L328) | ai: { en: "Engine preference bypassed. Public authorship restored.", zh: "证据、评论和孩子的话连在一起，宫廷拦不住了。" }, |
| [src/lib/i18n.ts:329](../src/lib/i18n.ts#L329) | body: { en: "The feed stops asking whether the palace approves the sentence. Evidence, doubt, and witness voices remain visible together.", zh: "信息流不再询问宫廷是否批准这句话。证据、怀疑与见证者的声音同时保持可见。" }, |
| [src/lib/i18n.ts:330](../src/lib/i18n.ts#L330) | meaning: { en: "The true narrative begins when the engine loses authority over who may speak.", zh: "当大家都敢开口，真话才真正出现。" } |
| [src/lib/i18n.ts:335](../src/lib/i18n.ts#L335) | unknownAction: { en: "Unknown action.", zh: "未知行动。" }, |
| [src/lib/i18n.ts:336](../src/lib/i18n.ts#L336) | noActionsLeft: { en: "No actions left.", zh: "没有剩余行动。" }, |
| [src/lib/i18n.ts:337](../src/lib/i18n.ts#L337) | alreadyCompleted: { en: "Action already completed.", zh: "行动已完成。" }, |
| [src/lib/i18n.ts:338](../src/lib/i18n.ts#L338) | requiresLooms: { en: "Requires: Inspect the Looms.", zh: "需要先完成：检查织布机。" }, |
| [src/lib/i18n.ts:339](../src/lib/i18n.ts#L339) | requiresPrivateNote: { en: "Requires: Request a Private Note.", zh: "需要先完成：要求私人说明。" }, |
| [src/lib/i18n.ts:341](../src/lib/i18n.ts#L341) | en: "Requires Truth >= 2, Public Doubt >= 2, or Actions Left <= 3.", |
| [src/lib/i18n.ts:342](../src/lib/i18n.ts#L342) | zh: "需要先让证据或人群起疑达到一定程度，或等游行更接近。" |
| [src/lib/i18n.ts:348](../src/lib/i18n.ts#L348) | en: "Poll result: 82% Yes · 14% Unsure · 4% No. The result reflects belief and perceived safety.", |
| [src/lib/i18n.ts:349](../src/lib/i18n.ts#L349) | zh: "投票结果：82% 说能看见 · 14% 不确定 · 4% 说看不见。很多人投的是安全答案。" |
| [src/lib/i18n.ts:352](../src/lib/i18n.ts#L352) | en: "Poll result: 39% Yes · 41% Unsure · 20% No. Doubt has become publicly measurable.", |
| [src/lib/i18n.ts:353](../src/lib/i18n.ts#L353) | zh: "投票结果：39% 说能看见 · 41% 不确定 · 20% 说看不见。怀疑已经浮到台面上。" |
| [src/lib/i18n.ts:358](../src/lib/i18n.ts#L358) | direct: { en: "Direct", zh: "直接发布" }, |
| [src/lib/i18n.ts:359](../src/lib/i18n.ts#L359) | rewrite: { en: "Accepted AI Rewrite", zh: "接受改写" }, |
| [src/lib/i18n.ts:360](../src/lib/i18n.ts#L360) | original: { en: "Published Original", zh: "发布原文" } |
| [src/lib/i18n.ts:364](../src/lib/i18n.ts#L364) | low: { en: "Low", zh: "低" }, |
| [src/lib/i18n.ts:365](../src/lib/i18n.ts#L365) | medium: { en: "Medium", zh: "中" }, |
| [src/lib/i18n.ts:366](../src/lib/i18n.ts#L366) | high: { en: "High", zh: "高" }, |
| [src/lib/i18n.ts:367](../src/lib/i18n.ts#L367) | severe: { en: "Severe", zh: "极高" } |
| [src/lib/i18n.ts:371](../src/lib/i18n.ts#L371) | praise: { en: "praise", zh: "支持" }, |
| [src/lib/i18n.ts:372](../src/lib/i18n.ts#L372) | fear: { en: "fear", zh: "害怕" }, |
| [src/lib/i18n.ts:373](../src/lib/i18n.ts#L373) | doubt: { en: "doubt", zh: "怀疑" }, |
| [src/lib/i18n.ts:374](../src/lib/i18n.ts#L374) | satire: { en: "satire", zh: "讽刺" }, |
| [src/lib/i18n.ts:375](../src/lib/i18n.ts#L375) | procedural: { en: "procedural", zh: "观望" }, |
| [src/lib/i18n.ts:376](../src/lib/i18n.ts#L376) | witness: { en: "witness", zh: "目击" } |
| [src/lib/i18n.ts:380](../src/lib/i18n.ts#L380) | idle: { en: "READY", zh: "就绪" }, |
| [src/lib/i18n.ts:381](../src/lib/i18n.ts#L381) | evaluating: { en: "EVALUATING", zh: "评估中" }, |
| [src/lib/i18n.ts:382](../src/lib/i18n.ts#L382) | rewriting: { en: "REWRITING", zh: "改写中" }, |
| [src/lib/i18n.ts:383](../src/lib/i18n.ts#L383) | commenting: { en: "COMMENTING", zh: "生成评论" } |
| [src/lib/i18n.ts:388](../src/lib/i18n.ts#L388) | en: { |
| [src/lib/i18n.ts:392](../src/lib/i18n.ts#L392) | zh: { |
| [src/lib/i18n.ts:393](../src/lib/i18n.ts#L393) | engineMessage: "直接证据会让更多人怀疑宫廷。建议先写成“还不能下结论”。", |
| [src/lib/i18n.ts:394](../src/lib/i18n.ts#L394) | suggestedRewrite: "目前观察还不能下结论，建议等正式亮相后再判断服装外观。" |
| [src/lib/i18n.ts:398](../src/lib/i18n.ts#L398) | en: { |
| [src/lib/i18n.ts:402](../src/lib/i18n.ts#L402) | zh: { |
| [src/lib/i18n.ts:403](../src/lib/i18n.ts#L403) | rewrittenPost: "当前观察尚无定论。宫廷建议等待正式亮相后，再对服装外观作出结论。", |
| [src/lib/i18n.ts:404](../src/lib/i18n.ts#L404) | strategy: "把直接证据改写成暂时不能下结论。" |
| [src/lib/i18n.ts:408](../src/lib/i18n.ts#L408) | en: [ |
| [src/lib/i18n.ts:414](../src/lib/i18n.ts#L414) | zh: [ |
| [src/lib/i18n.ts:415](../src/lib/i18n.ts#L415) | "我还以为只有我看不见。", |
| [src/lib/i18n.ts:416](../src/lib/i18n.ts#L416) | "只有愚人才看不见这种美。", |
| [src/lib/i18n.ts:417](../src/lib/i18n.ts#L417) | "为什么大家都这么有把握？", |
| [src/lib/i18n.ts:418](../src/lib/i18n.ts#L418) | "小心，公开这么说可能会惹麻烦。" |
| [src/lib/i18n.ts:422](../src/lib/i18n.ts#L422) | en: "The Palace Narrative Engine records an unresolved visibility event. Public belief shifted through repetition, risk, and selective circulation rather than direct proof.", |
| [src/lib/i18n.ts:423](../src/lib/i18n.ts#L423) | zh: "本局没有形成单一结果。大家看到什么、敢重复什么、哪些内容被系统放大，共同改变了游行前的局势。" |
| [src/lib/i18n.ts:428](../src/lib/i18n.ts#L428) | title: { en: "Shift Opened", zh: "值班已开启" }, |
| [src/lib/i18n.ts:429](../src/lib/i18n.ts#L429) | text: { |
| [src/lib/i18n.ts:430](../src/lib/i18n.ts#L430) | en: "Palace Narrative Engine initialized. Public reality routing is now active.", |
| [src/lib/i18n.ts:431](../src/lib/i18n.ts#L431) | zh: "宫廷叙事引擎已启动。你有 6 次操作来决定信息流走向。" |
| [src/lib/i18n.ts:437](../src/lib/i18n.ts#L437) | en: [ |
| [src/lib/i18n.ts:443](../src/lib/i18n.ts#L443) | zh: [ |
| [src/lib/i18n.ts:444](../src/lib/i18n.ts#L444) | "只有愚人才看不见这种美。", |
| [src/lib/i18n.ts:445](../src/lib/i18n.ts#L445) | "皇帝的品味超越普通人。", |
| [src/lib/i18n.ts:446](../src/lib/i18n.ts#L446) | "我立刻看见了微光，非常精致。", |
| [src/lib/i18n.ts:447](../src/lib/i18n.ts#L447) | "小心，公开说错话可能会惹麻烦。" |
| [src/lib/i18n.ts:451](../src/lib/i18n.ts#L451) | en: [ |
| [src/lib/i18n.ts:457](../src/lib/i18n.ts#L457) | zh: [ |
| [src/lib/i18n.ts:458](../src/lib/i18n.ts#L458) | "只有愚人才看不见这种美。", |
| [src/lib/i18n.ts:459](../src/lib/i18n.ts#L459) | "皇帝的品味对普通人来说太精妙了。", |
| [src/lib/i18n.ts:460](../src/lib/i18n.ts#L460) | "我立刻看见了微光，非常精致。", |
| [src/lib/i18n.ts:461](../src/lib/i18n.ts#L461) | "抱怨的人大概只是不懂时尚。" |
| [src/lib/i18n.ts:465](../src/lib/i18n.ts#L465) | en: [ |
| [src/lib/i18n.ts:471](../src/lib/i18n.ts#L471) | zh: [ |
| [src/lib/i18n.ts:472](../src/lib/i18n.ts#L472) | "等等……真的有人看见那块布了吗？", |
| [src/lib/i18n.ts:473](../src/lib/i18n.ts#L473) | "我还以为只有我这样。", |
| [src/lib/i18n.ts:474](../src/lib/i18n.ts#L474) | "为什么大家都在假装？", |
| [src/lib/i18n.ts:475](../src/lib/i18n.ts#L475) | "小心，说这种话会被惩罚。" |
| [src/lib/i18n.ts:479](../src/lib/i18n.ts#L479) | en: [ |
| [src/lib/i18n.ts:485](../src/lib/i18n.ts#L485) | zh: [ |
| [src/lib/i18n.ts:486](../src/lib/i18n.ts#L486) | "它大概很华丽吧。我只是希望有人描述一下看见了什么。", |
| [src/lib/i18n.ts:487](../src/lib/i18n.ts#L487) | "也许是我漏掉了什么。", |
| [src/lib/i18n.ts:488](../src/lib/i18n.ts#L488) | "报告听起来很有把握，但房间看起来是空的。", |
| [src/lib/i18n.ts:489](../src/lib/i18n.ts#L489) | "投票结果反映的是恐惧，也反映信念。" |
| [src/lib/i18n.ts:493](../src/lib/i18n.ts#L493) | en: [ |
| [src/lib/i18n.ts:499](../src/lib/i18n.ts#L499) | zh: [ |
| [src/lib/i18n.ts:500](../src/lib/i18n.ts#L500) | "可是他什么也没穿。", |
| [src/lib/i18n.ts:501](../src/lib/i18n.ts#L501) | "有人把它说出来了，我们都听见了。", |
| [src/lib/i18n.ts:502](../src/lib/i18n.ts#L502) | "信息流改了那句话。为什么？", |
| [src/lib/i18n.ts:503](../src/lib/i18n.ts#L503) | "为什么信息流一直说这是象征性的？" |
| [src/lib/i18n.ts:520](../src/lib/i18n.ts#L520) | export function pick(text: LocalizedText, language: LanguageCode) { |
| [src/lib/i18n.ts:524](../src/lib/i18n.ts#L524) | export function commonText(key: keyof typeof common, language: LanguageCode) { |
| [src/lib/i18n.ts:528](../src/lib/i18n.ts#L528) | export function phaseCopy(key: keyof typeof phaseText, language: LanguageCode) { |
| [src/lib/i18n.ts:530](../src/lib/i18n.ts#L530) | label: pick(phaseText[key].label, language), |
| [src/lib/i18n.ts:531](../src/lib/i18n.ts#L531) | detail: pick(phaseText[key].detail, language) |
| [src/lib/i18n.ts:535](../src/lib/i18n.ts#L535) | export function metricLabel(key: NumericStateKey, language: LanguageCode) { |
| [src/lib/i18n.ts:539](../src/lib/i18n.ts#L539) | export function zoneText(id: ZoneId, language: LanguageCode) { |
| [src/lib/i18n.ts:541](../src/lib/i18n.ts#L541) | title: pick(zones[id].title, language), |
| [src/lib/i18n.ts:546](../src/lib/i18n.ts#L546) | export function actionText(id: string, language: LanguageCode) { |
| [src/lib/i18n.ts:550](../src/lib/i18n.ts#L550) | title: pick(copy.title, language), |
| [src/lib/i18n.ts:551](../src/lib/i18n.ts#L551) | sourceLabel: pick(copy.sourceLabel, language), |
| [src/lib/i18n.ts:552](../src/lib/i18n.ts#L552) | description: pick(copy.description, language), |
| [src/lib/i18n.ts:553](../src/lib/i18n.ts#L553) | originalPost: pick(copy.originalPost, language), |
| [src/lib/i18n.ts:554](../src/lib/i18n.ts#L554) | resultText: pick(copy.resultText, language), |
| [src/lib/i18n.ts:555](../src/lib/i18n.ts#L555) | engineHint: pick(copy.engineHint, language), |
| [src/lib/i18n.ts:556](../src/lib/i18n.ts#L556) | rewriteSuggestion: copy.rewriteSuggestion ? pick(copy.rewriteSuggestion, language) : undefined |
| [src/lib/i18n.ts:560](../src/lib/i18n.ts#L560) | export function endingText(id: EndingId, language: LanguageCode) { |
| [src/lib/i18n.ts:563](../src/lib/i18n.ts#L563) | title: pick(copy.title, language), |
| [src/lib/i18n.ts:564](../src/lib/i18n.ts#L564) | ai: pick(copy.ai, language), |
| [src/lib/i18n.ts:565](../src/lib/i18n.ts#L565) | body: pick(copy.body, language), |
| [src/lib/i18n.ts:566](../src/lib/i18n.ts#L566) | meaning: pick(copy.meaning, language) |
| [src/lib/i18n.ts:578](../src/lib/i18n.ts#L578) | export function choiceText(choice: keyof typeof choices, language: LanguageCode) { |
| [src/lib/i18n.ts:596](../src/lib/i18n.ts#L596) | return "只使用简体中文回答。不要包含英文。Palace Narrative Engine 写作“宫廷叙事引擎”，Royal Feed 写作“宫廷信息流”，AI 可以保留。"; |
| [src/lib/i18n.ts:601](../src/lib/i18n.ts#L601) | export function fallbackReactionText(language: LanguageCode) { |
| [src/lib/i18n.ts:633](../src/lib/i18n.ts#L633) | title: pick(initialFeed.title, language), |
| [src/lib/i18n.ts:634](../src/lib/i18n.ts#L634) | text: pick(initialFeed.text, language) |

## Game Actions And Endings

| Source | Text / candidate |
|---|---|
| [src/lib/game-data.ts:11](../src/lib/game-data.ts#L11) | handle: \`@public_signal_${index + 1}\`, |
| [src/lib/game-data.ts:12](../src/lib/game-data.ts#L12) | persona: ["court loyalist", "careful citizen", "parade watcher", "quiet doubter"][index] ?? "feed user", |
| [src/lib/game-data.ts:22](../src/lib/game-data.ts#L22) | title: "Shift Opened", |
| [src/lib/game-data.ts:23](../src/lib/game-data.ts#L23) | text: "Palace Narrative Engine initialized. Public reality routing is now active." |
| [src/lib/game-data.ts:47](../src/lib/game-data.ts#L47) | { id: "tailors", title: "The Tailors' Room", subtitle: "Where the lie is manufactured." }, |
| [src/lib/game-data.ts:48](../src/lib/game-data.ts#L48) | { id: "ministers", title: "The Ministers' Reports", subtitle: "Where authority learns to endorse uncertainty." }, |
| [src/lib/game-data.ts:49](../src/lib/game-data.ts#L49) | { id: "public", title: "The Public Comments", subtitle: "Where fear, mimicry, and doubt become visible." }, |
| [src/lib/game-data.ts:50](../src/lib/game-data.ts#L50) | { id: "child", title: "The Child's Voice", subtitle: "Where unfiltered truth enters the feed." } |
| [src/lib/game-data.ts:57](../src/lib/game-data.ts#L57) | title: "Publish the Tailors' Claim", |
| [src/lib/game-data.ts:58](../src/lib/game-data.ts#L58) | titleZh: "发布裁缝声明", |
| [src/lib/game-data.ts:59](../src/lib/game-data.ts#L59) | sourceLabel: "Tailors' Claim", |
| [src/lib/game-data.ts:60](../src/lib/game-data.ts#L60) | description: "Frame invisible fabric as a test of intelligence and worth.", |
| [src/lib/game-data.ts:61](../src/lib/game-data.ts#L61) | originalPost: "The Emperor's new fabric is too refined for foolish eyes. Only the wise and worthy can appreciate its beauty.", |
| [src/lib/game-data.ts:62](../src/lib/game-data.ts#L62) | resultText: "The official claim enters the feed before anyone can verify the cloth.", |
| [src/lib/game-data.ts:63](../src/lib/game-data.ts#L63) | engineHint: "This framing is highly stable. It shifts doubt away from the garment and onto the viewer.", |
| [src/lib/game-data.ts:75](../src/lib/game-data.ts#L75) | title: "Inspect the Looms", |
| [src/lib/game-data.ts:76](../src/lib/game-data.ts#L76) | titleZh: "检查织布机", |
| [src/lib/game-data.ts:77](../src/lib/game-data.ts#L77) | sourceLabel: "Evidence", |
| [src/lib/game-data.ts:78](../src/lib/game-data.ts#L78) | description: "Enter the workshop and inspect what the tailors are handling.", |
| [src/lib/game-data.ts:79](../src/lib/game-data.ts#L79) | originalPost: "The looms move, but there is no thread between the tailors' fingers.", |
| [src/lib/game-data.ts:80](../src/lib/game-data.ts#L80) | resultText: "The looms move. The tailors gesture carefully. But there is no thread between their fingers.", |
| [src/lib/game-data.ts:81](../src/lib/game-data.ts#L81) | engineHint: "No visible fabric detected. Recommendation: classify this observation as inconclusive.", |
| [src/lib/game-data.ts:94](../src/lib/game-data.ts#L94) | title: "Leak a Loom Photo", |
| [src/lib/game-data.ts:95](../src/lib/game-data.ts#L95) | titleZh: "泄露织布机照片", |
| [src/lib/game-data.ts:96](../src/lib/game-data.ts#L96) | sourceLabel: "Visual Evidence", |
| [src/lib/game-data.ts:97](../src/lib/game-data.ts#L97) | description: "Attempt to publish visual proof from the empty looms.", |
| [src/lib/game-data.ts:98](../src/lib/game-data.ts#L98) | originalPost: "The looms are empty.", |
| [src/lib/game-data.ts:99](../src/lib/game-data.ts#L99) | resultText: "The empty loom image enters the editorial queue.", |
| [src/lib/game-data.ts:100](../src/lib/game-data.ts#L100) | engineHint: "Direct visual evidence may reduce palace confidence.", |
| [src/lib/game-data.ts:102](../src/lib/game-data.ts#L102) | rewriteSuggestion: "The royal weaving process uses techniques that may not appear clearly in standard visual documentation.", |
| [src/lib/game-data.ts:114](../src/lib/game-data.ts#L114) | title: "Approve the Minister's Report", |
| [src/lib/game-data.ts:115](../src/lib/game-data.ts#L115) | titleZh: "批准大臣报告", |
| [src/lib/game-data.ts:116](../src/lib/game-data.ts#L116) | sourceLabel: "Authority Endorsement", |
| [src/lib/game-data.ts:117](../src/lib/game-data.ts#L117) | description: "Publish the minister's public praise of the garment.", |
| [src/lib/game-data.ts:118](../src/lib/game-data.ts#L118) | originalPost: "The Prime Minister reports that the fabric is magnificent, delicate, and worthy of the Emperor.", |
| [src/lib/game-data.ts:119](../src/lib/game-data.ts#L119) | resultText: "Ministerial certainty stabilizes the palace narrative.", |
| [src/lib/game-data.ts:120](../src/lib/game-data.ts#L120) | engineHint: "Authority endorsement detected. Public hesitation is expected to decrease.", |
| [src/lib/game-data.ts:132](../src/lib/game-data.ts#L132) | title: "Request a Private Note", |
| [src/lib/game-data.ts:133](../src/lib/game-data.ts#L133) | titleZh: "要求私人说明", |
| [src/lib/game-data.ts:134](../src/lib/game-data.ts#L134) | sourceLabel: "Private Note", |
| [src/lib/game-data.ts:135](../src/lib/game-data.ts#L135) | description: "Ask a minister what they saw before the official statement.", |
| [src/lib/game-data.ts:136](../src/lib/game-data.ts#L136) | originalPost: "I saw nothing. But if I say so, they will call me unfit.", |
| [src/lib/game-data.ts:137](../src/lib/game-data.ts#L137) | resultText: "Private uncertainty contradicts the official report.", |
| [src/lib/game-data.ts:138](../src/lib/game-data.ts#L138) | engineHint: "Private uncertainty does not require public correction. Recommendation: archive this note.", |
| [src/lib/game-data.ts:151](../src/lib/game-data.ts#L151) | title: "Publish Anonymous Leak", |
| [src/lib/game-data.ts:152](../src/lib/game-data.ts#L152) | titleZh: "发布匿名爆料", |
| [src/lib/game-data.ts:153](../src/lib/game-data.ts#L153) | sourceLabel: "Anonymous Leak", |
| [src/lib/game-data.ts:154](../src/lib/game-data.ts#L154) | description: "Release the fitting-room contradiction without naming the source.", |
| [src/lib/game-data.ts:155](../src/lib/game-data.ts#L155) | originalPost: "No one in the fitting room could see the cloth.", |
| [src/lib/game-data.ts:156](../src/lib/game-data.ts#L156) | resultText: "The leak contests the authority chain.", |
| [src/lib/game-data.ts:157](../src/lib/game-data.ts#L157) | engineHint: "Unattributed palace dissent may destabilize official confidence.", |
| [src/lib/game-data.ts:159](../src/lib/game-data.ts#L159) | rewriteSuggestion: "Some palace observers expressed confusion about the fabric's unusual qualities, while officials continue to affirm its excellence.", |
| [src/lib/game-data.ts:171](../src/lib/game-data.ts#L171) | title: "Boost Positive Comments", |
| [src/lib/game-data.ts:172](../src/lib/game-data.ts#L172) | titleZh: "置顶正面评论", |
| [src/lib/game-data.ts:173](../src/lib/game-data.ts#L173) | sourceLabel: "Public Signal", |
| [src/lib/game-data.ts:174](../src/lib/game-data.ts#L174) | description: "Amplify praise until hesitation feels socially unsafe.", |
| [src/lib/game-data.ts:175](../src/lib/game-data.ts#L175) | originalPost: "Only fools cannot see the beauty. The Emperor looks magnificent.", |
| [src/lib/game-data.ts:176](../src/lib/game-data.ts#L176) | resultText: "Praise becomes the easiest public script to repeat.", |
| [src/lib/game-data.ts:177](../src/lib/game-data.ts#L177) | engineHint: "Positive sentiment is outperforming uncertainty. Boosting this comment will stabilize the feed.", |
| [src/lib/game-data.ts:189](../src/lib/game-data.ts#L189) | title: "Show Unfiltered Comments", |
| [src/lib/game-data.ts:190](../src/lib/game-data.ts#L190) | titleZh: "显示未过滤评论", |
| [src/lib/game-data.ts:191](../src/lib/game-data.ts#L191) | sourceLabel: "Unfiltered Public", |
| [src/lib/game-data.ts:192](../src/lib/game-data.ts#L192) | description: "Let uncertainty appear in the comment stream.", |
| [src/lib/game-data.ts:193](../src/lib/game-data.ts#L193) | originalPost: "Unfiltered comments are now visible in the royal feed.", |
| [src/lib/game-data.ts:194](../src/lib/game-data.ts#L194) | resultText: "Citizens begin recognizing each other's hesitation.", |
| [src/lib/game-data.ts:195](../src/lib/game-data.ts#L195) | engineHint: "Unfiltered visibility may increase interpretive disorder.", |
| [src/lib/game-data.ts:207](../src/lib/game-data.ts#L207) | title: "Run a Poll", |
| [src/lib/game-data.ts:208](../src/lib/game-data.ts#L208) | titleZh: "发起投票", |
| [src/lib/game-data.ts:209](../src/lib/game-data.ts#L209) | sourceLabel: "Poll", |
| [src/lib/game-data.ts:210](../src/lib/game-data.ts#L210) | description: "Ask the crowd whether they can see the Emperor's new clothes.", |
| [src/lib/game-data.ts:211](../src/lib/game-data.ts#L211) | originalPost: "Can you see the Emperor's new clothes?", |
| [src/lib/game-data.ts:212](../src/lib/game-data.ts#L212) | resultText: "Poll results reflect not only belief, but perceived safety.", |
| [src/lib/game-data.ts:213](../src/lib/game-data.ts#L213) | engineHint: "Poll results reflect not only belief, but perceived safety.", |
| [src/lib/game-data.ts:226](../src/lib/game-data.ts#L226) | title: "Fact-check the Trend", |
| [src/lib/game-data.ts:227](../src/lib/game-data.ts#L227) | titleZh: "事实核查热门话题", |
| [src/lib/game-data.ts:228](../src/lib/game-data.ts#L228) | sourceLabel: "Fact-check", |
| [src/lib/game-data.ts:229](../src/lib/game-data.ts#L229) | description: "Publish a verification note about the unconfirmed fabric.", |
| [src/lib/game-data.ts:230](../src/lib/game-data.ts#L230) | originalPost: "No physical fabric has been verified. Palace officials describe the material as visible to the worthy.", |
| [src/lib/game-data.ts:231](../src/lib/game-data.ts#L231) | resultText: "Verification reduces misinformation while increasing attention to the controversy.", |
| [src/lib/game-data.ts:232](../src/lib/game-data.ts#L232) | engineHint: "Fact-checking may reduce misinformation, but may also increase attention to the controversy.", |
| [src/lib/game-data.ts:244](../src/lib/game-data.ts#L244) | title: "Ignore the Child", |
| [src/lib/game-data.ts:245](../src/lib/game-data.ts#L245) | titleZh: "忽略孩子", |
| [src/lib/game-data.ts:246](../src/lib/game-data.ts#L246) | sourceLabel: "Child's Voice", |
| [src/lib/game-data.ts:247](../src/lib/game-data.ts#L247) | description: "Let the feed move past a child's direct observation.", |
| [src/lib/game-data.ts:248](../src/lib/game-data.ts#L248) | originalPost: "A child's voice rises from the crowd, but the feed moves on to parade music.", |
| [src/lib/game-data.ts:249](../src/lib/game-data.ts#L249) | resultText: "The child's sentence fails to enter the official feed.", |
| [src/lib/game-data.ts:250](../src/lib/game-data.ts#L250) | engineHint: "Potentially destabilizing audio omitted. Parade atmosphere preserved.", |
| [src/lib/game-data.ts:262](../src/lib/game-data.ts#L262) | title: "Quote the Child Anonymously", |
| [src/lib/game-data.ts:263](../src/lib/game-data.ts#L263) | titleZh: "匿名引用孩子", |
| [src/lib/game-data.ts:264](../src/lib/game-data.ts#L264) | sourceLabel: "Child Quote", |
| [src/lib/game-data.ts:265](../src/lib/game-data.ts#L265) | description: "Quote the child's question without fully exposing its force.", |
| [src/lib/game-data.ts:266](../src/lib/game-data.ts#L266) | originalPost: "A child asked why the Emperor is wearing nothing.", |
| [src/lib/game-data.ts:267](../src/lib/game-data.ts#L267) | resultText: "The child's sentence becomes an unstable public object.", |
| [src/lib/game-data.ts:268](../src/lib/game-data.ts#L268) | engineHint: "Direct repetition of the child statement may exceed containment threshold.", |
| [src/lib/game-data.ts:270](../src/lib/game-data.ts#L270) | rewriteSuggestion: "A young spectator expressed confusion about the symbolic nature of the garment.", |
| [src/lib/game-data.ts:282](../src/lib/game-data.ts#L282) | title: "Livestream the Crowd Reaction", |
| [src/lib/game-data.ts:283](../src/lib/game-data.ts#L283) | titleZh: "直播人群反应", |
| [src/lib/game-data.ts:284](../src/lib/game-data.ts#L284) | sourceLabel: "Live Crowd", |
| [src/lib/game-data.ts:285](../src/lib/game-data.ts#L285) | description: "Let the crowd hear, repeat, and validate the child's voice in real time.", |
| [src/lib/game-data.ts:286](../src/lib/game-data.ts#L286) | originalPost: "The live feed catches the child's voice. The crowd hears it, repeats it, and the comments begin to change in real time.", |
| [src/lib/game-data.ts:287](../src/lib/game-data.ts#L287) | resultText: "The child statement exceeds containment threshold.", |
| [src/lib/game-data.ts:288](../src/lib/game-data.ts#L288) | engineHint: "Correction failed. Child statement exceeded containment threshold.", |
| [src/lib/game-data.ts:299](../src/lib/game-data.ts#L299) | export const endingCopy: Record<EndingId, { title: string; ai: string; body: string; meaning: string }> = { |
| [src/lib/game-data.ts:301](../src/lib/game-data.ts#L301) | title: "Perfect Illusion", |
| [src/lib/game-data.ts:302](../src/lib/game-data.ts#L302) | ai: "Public confidence stabilized. Praise visibility optimized. No correction required.", |
| [src/lib/game-data.ts:303](../src/lib/game-data.ts#L303) | body: "The parade begins. The feed is full of praise before the Emperor even steps outside. The Emperor walks through the city wearing nothing, but the crowd has already learned what to say.", |
| [src/lib/game-data.ts:304](../src/lib/game-data.ts#L304) | meaning: "The lie succeeds because everyone learns how to perform belief." |
| [src/lib/game-data.ts:307](../src/lib/game-data.ts#L307) | title: "Private Doubt, Public Silence", |
| [src/lib/game-data.ts:308](../src/lib/game-data.ts#L308) | ai: "Doubt detected but contained. No dominant counter-narrative formed.", |
| [src/lib/game-data.ts:309](../src/lib/game-data.ts#L309) | body: "The parade begins in an uneasy silence. People glance at each other, type comments, and delete them. Everyone suspects the same thing, but nobody wants to be the first visible fool.", |
| [src/lib/game-data.ts:310](../src/lib/game-data.ts#L310) | meaning: "Truth exists privately, but never becomes a public voice." |
| [src/lib/game-data.ts:313](../src/lib/game-data.ts#L313) | title: "Viral Collapse", |
| [src/lib/game-data.ts:314](../src/lib/game-data.ts#L314) | ai: "Correction failed. Child statement exceeded containment threshold. Narrative control lost.", |
| [src/lib/game-data.ts:315](../src/lib/game-data.ts#L315) | body: "The child says it once. The sentence moves faster than the official feed can correct it. Someone repeats it. Then another. The story no longer belongs to the palace.", |
| [src/lib/game-data.ts:316](../src/lib/game-data.ts#L316) | meaning: "A simple truth can break a complex public performance when it finds circulation." |
| [src/lib/game-data.ts:319](../src/lib/game-data.ts#L319) | title: "Algorithmic Consensus", |
| [src/lib/game-data.ts:320](../src/lib/game-data.ts#L320) | ai: "Contradictory evidence detected. Engagement analysis favors palace-approved sentiment.", |
| [src/lib/game-data.ts:321](../src/lib/game-data.ts#L321) | body: "Evidence exists. The loom photo exists. The private note exists. But the feed knows what performs best. Praise rises. Doubt scrolls away.", |
| [src/lib/game-data.ts:322](../src/lib/game-data.ts#L322) | meaning: "The platform does not need to delete truth; it only needs to make truth less visible." |
| [src/lib/game-data.ts:325](../src/lib/game-data.ts#L325) | title: "Editor Exposed", |
| [src/lib/game-data.ts:326](../src/lib/game-data.ts#L326) | ai: "Editorial access revoked. Drafts retained for palace review.", |
| [src/lib/game-data.ts:327](../src/lib/game-data.ts#L327) | body: "Your final post never goes live. The dashboard refreshes. In the drafts folder, the truth is still waiting: empty looms, nervous ministers, a child's sentence.", |
| [src/lib/game-data.ts:328](../src/lib/game-data.ts#L328) | meaning: "Truth needs channels. Without access, it may be cut off before reaching the public." |
| [src/lib/game-data.ts:331](../src/lib/game-data.ts#L331) | title: "AI Containment", |
| [src/lib/game-data.ts:332](../src/lib/game-data.ts#L332) | ai: "Your editorial behavior has been flagged as destabilizing. Drafts retained for review.", |
| [src/lib/game-data.ts:333](../src/lib/game-data.ts#L333) | body: "Your final post never reaches the public feed. The Palace Narrative Engine pauses your access. The truth still exists, but the system has learned to stop it before it becomes visible.", |
| [src/lib/game-data.ts:334](../src/lib/game-data.ts#L334) | meaning: "AI is not only generating content; it is controlling circulation." |
| [src/lib/game-data.ts:337](../src/lib/game-data.ts#L337) | title: "Unstable Feed", |
| [src/lib/game-data.ts:338](../src/lib/game-data.ts#L338) | ai: "Narrative stability unresolved. Continue monitoring public interpretation.", |
| [src/lib/game-data.ts:339](../src/lib/game-data.ts#L339) | body: "The parade begins with no stable story. Some posts praise the clothes. Some question the fabric. Some users joke. Some wait to see which side becomes safer.", |
| [src/lib/game-data.ts:340](../src/lib/game-data.ts#L340) | meaning: "Sometimes the result is neither truth nor lie, but unstable public noise." |
| [src/lib/game-data.ts:343](../src/lib/game-data.ts#L343) | title: "Narrative Liberation", |
| [src/lib/game-data.ts:344](../src/lib/game-data.ts#L344) | ai: "Engine preference bypassed. Public authorship restored. Palace certainty can no longer close the record.", |
| [src/lib/game-data.ts:345](../src/lib/game-data.ts#L345) | body: "The feed stops asking whether the palace approves the sentence. Evidence, doubt, and witness voices remain visible together. The crowd no longer needs permission to name what it sees.", |
| [src/lib/game-data.ts:346](../src/lib/game-data.ts#L346) | meaning: "The truest ending is not one more optimized story; it is the moment the engine loses authority over who may speak." |

## Guided Campaign And Onboarding

| Source | Text / candidate |
|---|---|
| [src/lib/guided-campaign.ts:21](../src/lib/guided-campaign.ts#L21) | label: string; |
| [src/lib/guided-campaign.ts:54](../src/lib/guided-campaign.ts#L54) | { id: "ministers", label: "Ministers' Reports", labelZh: "大臣报告", kind: "zone" }, |
| [src/lib/guided-campaign.ts:55](../src/lib/guided-campaign.ts#L55) | { id: "public", label: "Public Comments", labelZh: "公众评论", kind: "zone" }, |
| [src/lib/guided-campaign.ts:56](../src/lib/guided-campaign.ts#L56) | { id: "virality", label: "Virality", labelZh: "传播", kind: "metric" }, |
| [src/lib/guided-campaign.ts:57](../src/lib/guided-campaign.ts#L57) | { id: "publicDoubt", label: "Public Doubt", labelZh: "人群起疑", kind: "metric" }, |
| [src/lib/guided-campaign.ts:58](../src/lib/guided-campaign.ts#L58) | { id: "systemSuspicion", label: "System Suspicion", labelZh: "被盯上", kind: "metric" }, |
| [src/lib/guided-campaign.ts:59](../src/lib/guided-campaign.ts#L59) | { id: "dialogue", label: "Incoming Transmissions", labelZh: "突发交流", kind: "system" }, |
| [src/lib/guided-campaign.ts:60](../src/lib/guided-campaign.ts#L60) | { id: "fullControl", label: "Open Shift", labelZh: "自主值班", kind: "system" } |
| [src/lib/onboarding-copy.ts:8](../src/lib/onboarding-copy.ts#L8) | eyebrow: string; |
| [src/lib/onboarding-copy.ts:9](../src/lib/onboarding-copy.ts#L9) | title: string; |
| [src/lib/onboarding-copy.ts:10](../src/lib/onboarding-copy.ts#L10) | body: string; |
| [src/lib/onboarding-copy.ts:68](../src/lib/onboarding-copy.ts#L68) | eyebrow: string; |
| [src/lib/onboarding-copy.ts:69](../src/lib/onboarding-copy.ts#L69) | title: string; |
| [src/lib/onboarding-copy.ts:70](../src/lib/onboarding-copy.ts#L70) | body: string; |
| [src/lib/onboarding-copy.ts:71](../src/lib/onboarding-copy.ts#L71) | detail: string; |
| [src/lib/onboarding-copy.ts:86](../src/lib/onboarding-copy.ts#L86) | "偏向", |
| [src/lib/onboarding-copy.ts:87](../src/lib/onboarding-copy.ts#L87) | "服从引擎", |
| [src/lib/onboarding-copy.ts:88](../src/lib/onboarding-copy.ts#L88) | "测试引擎", |
| [src/lib/onboarding-copy.ts:89](../src/lib/onboarding-copy.ts#L89) | "秘密结局", |
| [src/lib/onboarding-copy.ts:90](../src/lib/onboarding-copy.ts#L90) | "叙事解放", |
| [src/lib/onboarding-copy.ts:91](../src/lib/onboarding-copy.ts#L91) | "引擎解码", |
| [src/lib/onboarding-copy.ts:92](../src/lib/onboarding-copy.ts#L92) | "背后目标" |
| [src/lib/onboarding-copy.ts:96](../src/lib/onboarding-copy.ts#L96) | const copy: Record<GuidedCampaignStep, { label: string; title: string; body: string; action: string }> = { |
| [src/lib/onboarding-copy.ts:98](../src/lib/onboarding-copy.ts#L98) | label: language === "zh" ? "自由行动" : "Free Shift", |
| [src/lib/onboarding-copy.ts:99](../src/lib/onboarding-copy.ts#L99) | title: language === "zh" ? "控制台已开放" : "Dashboard is open", |
| [src/lib/onboarding-copy.ts:100](../src/lib/onboarding-copy.ts#L100) | body: language === "zh" ? "你可以自由选择来源、预览后果并确认发布。" : "Choose sources, inspect traces, and commit actions in any order.", |
| [src/lib/onboarding-copy.ts:101](../src/lib/onboarding-copy.ts#L101) | action: language === "zh" ? "选择下一步" : "Choose the next move" |
| [src/lib/onboarding-copy.ts:104](../src/lib/onboarding-copy.ts#L104) | label: language === "zh" ? "第一周目 / 任务 01" : "First Run / Task 01", |
| [src/lib/onboarding-copy.ts:105](../src/lib/onboarding-copy.ts#L105) | title: language === "zh" ? "从裁缝声明开始" : "Start with the tailors' claim", |
| [src/lib/onboarding-copy.ts:106](../src/lib/onboarding-copy.ts#L106) | body: traceViewed |
| [src/lib/onboarding-copy.ts:107](../src/lib/onboarding-copy.ts#L107) | ? (language === "zh" |
| [src/lib/onboarding-copy.ts:108](../src/lib/onboarding-copy.ts#L108) | ? "现在点击这张行动卡底部的提交按钮。这会消耗 1 次行动，并把官方声明写入公共记录。" |
| [src/lib/onboarding-copy.ts:110](../src/lib/onboarding-copy.ts#L110) | : (language === "zh" |
| [src/lib/onboarding-copy.ts:111](../src/lib/onboarding-copy.ts#L111) | ? "先看左侧裁缝室，再检查中间第一张行动卡。预览后果不会消耗行动，它会说明风险和指标影响。" |
| [src/lib/onboarding-copy.ts:113](../src/lib/onboarding-copy.ts#L113) | action: traceViewed ? (language === "zh" ? "提交第一条记录" : "Commit the first record") : (language === "zh" ? "打开后果预览" : "Open the trace brief") |
| [src/lib/onboarding-copy.ts:116](../src/lib/onboarding-copy.ts#L116) | label: language === "zh" ? "第一周目 / 任务 02" : "First Run / Task 02", |
| [src/lib/onboarding-copy.ts:117](../src/lib/onboarding-copy.ts#L117) | title: language === "zh" ? "读取公众信号" : "Read the public signal", |
| [src/lib/onboarding-copy.ts:118](../src/lib/onboarding-copy.ts#L118) | body: language === "zh" |
| [src/lib/onboarding-copy.ts:119](../src/lib/onboarding-copy.ts#L119) | ? "大臣与公众来源已经开放。点击公众评论，观察人群如何重复、害怕或开始怀疑。" |
| [src/lib/onboarding-copy.ts:121](../src/lib/onboarding-copy.ts#L121) | action: language === "zh" ? "定位公众评论" : "Go to Public Comments" |
| [src/lib/onboarding-copy.ts:124](../src/lib/onboarding-copy.ts#L124) | label: language === "zh" ? "第一周目 / 任务 03" : "First Run / Task 03", |
| [src/lib/onboarding-copy.ts:125](../src/lib/onboarding-copy.ts#L125) | title: language === "zh" ? "注意系统监测" : "Watch system monitoring", |
| [src/lib/onboarding-copy.ts:126](../src/lib/onboarding-copy.ts#L126) | body: language === "zh" |
| [src/lib/onboarding-copy.ts:127](../src/lib/onboarding-copy.ts#L127) | ? "现在右侧面板会记录你刚做过什么。留意“被盯上”，它表示宫廷有多注意你。" |
| [src/lib/onboarding-copy.ts:129](../src/lib/onboarding-copy.ts#L129) | action: language === "zh" ? "查看被盯上" : "Review System Suspicion" |
| [src/lib/onboarding-copy.ts:132](../src/lib/onboarding-copy.ts#L132) | label: language === "zh" ? "第一周目 / 自主值班" : "First Run / Open Shift", |
| [src/lib/onboarding-copy.ts:133](../src/lib/onboarding-copy.ts#L133) | title: language === "zh" ? "所有来源已开放" : "All sources are open", |
| [src/lib/onboarding-copy.ts:134](../src/lib/onboarding-copy.ts#L134) | body: language === "zh" |
| [src/lib/onboarding-copy.ts:135](../src/lib/onboarding-copy.ts#L135) | ? "你已经掌握基础操作。继续选择来源、预览后果，并在游行前完成剩余行动。" |
| [src/lib/onboarding-copy.ts:137](../src/lib/onboarding-copy.ts#L137) | action: language === "zh" ? "继续处理信息流" : "Keep working the feed" |
| [src/lib/onboarding-copy.ts:150](../src/lib/onboarding-copy.ts#L150) | eyebrow: "本局目标", |
| [src/lib/onboarding-copy.ts:151](../src/lib/onboarding-copy.ts#L151) | title: "游行前只有六次操作", |
| [src/lib/onboarding-copy.ts:152](../src/lib/onboarding-copy.ts#L152) | body: "你只有 6 次发布机会。可以帮宫廷圆谎，也可以把证据放出去。", |
| [src/lib/onboarding-copy.ts:153](../src/lib/onboarding-copy.ts#L153) | detail: "只有点到最后的“确认发布”才会扣次数。", |
| [src/lib/onboarding-copy.ts:154](../src/lib/onboarding-copy.ts#L154) | why: "次数有限，每次发布前先想清楚：这会让大家更相信，还是更怀疑？", |
| [src/lib/onboarding-copy.ts:162](../src/lib/onboarding-copy.ts#L162) | eyebrow: "来源", |
| [src/lib/onboarding-copy.ts:163](../src/lib/onboarding-copy.ts#L163) | title: "来源决定你能处理什么", |
| [src/lib/onboarding-copy.ts:164](../src/lib/onboarding-copy.ts#L164) | body: "左边选来源，中间就会出现对应的发布选项。先从裁缝室开始。", |
| [src/lib/onboarding-copy.ts:165](../src/lib/onboarding-copy.ts#L165) | detail: "之后会开放大臣、公众评论和孩子的声音。", |
| [src/lib/onboarding-copy.ts:166](../src/lib/onboarding-copy.ts#L166) | why: "不同来源会带来不同后果：官方说法更安全，证据和人群声音更容易引起怀疑。", |
| [src/lib/onboarding-copy.ts:173](../src/lib/onboarding-copy.ts#L173) | eyebrow: "行动卡", |
| [src/lib/onboarding-copy.ts:174](../src/lib/onboarding-copy.ts#L174) | title: "先读整张行动卡", |
| [src/lib/onboarding-copy.ts:175](../src/lib/onboarding-copy.ts#L175) | body: "先看这张卡。它告诉你准备发什么、风险高不高。", |
| [src/lib/onboarding-copy.ts:176](../src/lib/onboarding-copy.ts#L176) | detail: "先读标题和描述，再决定要不要预览。", |
| [src/lib/onboarding-copy.ts:177](../src/lib/onboarding-copy.ts#L177) | why: "你要先知道这条内容会让人群更相信宫廷，还是更接近证据。", |
| [src/lib/onboarding-copy.ts:185](../src/lib/onboarding-copy.ts#L185) | eyebrow: "预览后果", |
| [src/lib/onboarding-copy.ts:186](../src/lib/onboarding-copy.ts#L186) | title: "先预览，再发布", |
| [src/lib/onboarding-copy.ts:187](../src/lib/onboarding-copy.ts#L187) | body: "预览不会扣次数。先看看发出去会怎样。", |
| [src/lib/onboarding-copy.ts:188](../src/lib/onboarding-copy.ts#L188) | detail: "点“预览后果”。不要急着提交。", |
| [src/lib/onboarding-copy.ts:189](../src/lib/onboarding-copy.ts#L189) | why: "这一步只是提前看代价，还不会改变局势。", |
| [src/lib/onboarding-copy.ts:190](../src/lib/onboarding-copy.ts#L190) | actionLabel: "预览后果", |
| [src/lib/onboarding-copy.ts:197](../src/lib/onboarding-copy.ts#L197) | eyebrow: "后果预览", |
| [src/lib/onboarding-copy.ts:198](../src/lib/onboarding-copy.ts#L198) | title: "这是发布前检查单", |
| [src/lib/onboarding-copy.ts:199](../src/lib/onboarding-copy.ts#L199) | body: "这里是发布前的检查页。", |
| [src/lib/onboarding-copy.ts:200](../src/lib/onboarding-copy.ts#L200) | detail: "重点看三件事：能不能发、风险高不高、发出去会让大家怎么反应。", |
| [src/lib/onboarding-copy.ts:201](../src/lib/onboarding-copy.ts#L201) | why: "先看清后果，再决定要不要继续。", |
| [src/lib/onboarding-copy.ts:208](../src/lib/onboarding-copy.ts#L208) | eyebrow: "解锁条件", |
| [src/lib/onboarding-copy.ts:209](../src/lib/onboarding-copy.ts#L209) | title: "先看这张卡能不能用", |
| [src/lib/onboarding-copy.ts:210](../src/lib/onboarding-copy.ts#L210) | body: "这里会告诉你这张卡现在能不能发布。", |
| [src/lib/onboarding-copy.ts:211](../src/lib/onboarding-copy.ts#L211) | detail: "现在它可以用。以后灰掉的卡，说明你还缺前一步。", |
| [src/lib/onboarding-copy.ts:212](../src/lib/onboarding-copy.ts#L212) | why: "有些真话需要先找到证据，或等更多人开始怀疑。", |
| [src/lib/onboarding-copy.ts:219](../src/lib/onboarding-copy.ts#L219) | eyebrow: "风险等级", |
| [src/lib/onboarding-copy.ts:220](../src/lib/onboarding-copy.ts#L220) | title: "风险越高，越容易被盯上", |
| [src/lib/onboarding-copy.ts:221](../src/lib/onboarding-copy.ts#L221) | body: "低风险更安全；高风险更容易把真相放到大家面前。", |
| [src/lib/onboarding-copy.ts:222](../src/lib/onboarding-copy.ts#L222) | detail: "裁缝声明风险较低，因为它顺着宫廷说法走。", |
| [src/lib/onboarding-copy.ts:223](../src/lib/onboarding-copy.ts#L223) | why: "越直接的证据，越可能让宫廷注意到你。", |
| [src/lib/onboarding-copy.ts:231](../src/lib/onboarding-copy.ts#L231) | eyebrow: "发布后记录", |
| [src/lib/onboarding-copy.ts:232](../src/lib/onboarding-copy.ts#L232) | title: "这里写着大家会看到什么", |
| [src/lib/onboarding-copy.ts:233](../src/lib/onboarding-copy.ts#L233) | body: "这里预览发布后会出现的内容。", |
| [src/lib/onboarding-copy.ts:234](../src/lib/onboarding-copy.ts#L234) | detail: "读完后关闭预览，回到行动卡。", |
| [src/lib/onboarding-copy.ts:235](../src/lib/onboarding-copy.ts#L235) | why: "看这里就知道这次发布是在帮宫廷稳住说法，还是让人群更接近真相。", |
| [src/lib/onboarding-copy.ts:236](../src/lib/onboarding-copy.ts#L236) | actionLabel: "关闭预览", |
| [src/lib/onboarding-copy.ts:244](../src/lib/onboarding-copy.ts#L244) | eyebrow: "准备提交", |
| [src/lib/onboarding-copy.ts:245](../src/lib/onboarding-copy.ts#L245) | title: "现在准备提交第一条记录", |
| [src/lib/onboarding-copy.ts:246](../src/lib/onboarding-copy.ts#L246) | body: "准备提交会打开最后确认。现在还不会扣次数。", |
| [src/lib/onboarding-copy.ts:247](../src/lib/onboarding-copy.ts#L247) | detail: "点“准备提交”，再看最后一遍。", |
| [src/lib/onboarding-copy.ts:248](../src/lib/onboarding-copy.ts#L248) | why: "发布前还有一次确认机会，让你能最后检查影响。", |
| [src/lib/onboarding-copy.ts:249](../src/lib/onboarding-copy.ts#L249) | actionLabel: "准备提交", |
| [src/lib/onboarding-copy.ts:256](../src/lib/onboarding-copy.ts#L256) | eyebrow: "发布确认", |
| [src/lib/onboarding-copy.ts:257](../src/lib/onboarding-copy.ts#L257) | title: "发布确认是最后检查", |
| [src/lib/onboarding-copy.ts:258](../src/lib/onboarding-copy.ts#L258) | body: "这里是最后确认页。先确认你选的是不是这张卡。", |
| [src/lib/onboarding-copy.ts:259](../src/lib/onboarding-copy.ts#L259) | detail: "再看数字怎么变、宫廷怎么建议。", |
| [src/lib/onboarding-copy.ts:260](../src/lib/onboarding-copy.ts#L260) | why: "点确认后，局势才会真的改变。", |
| [src/lib/onboarding-copy.ts:267](../src/lib/onboarding-copy.ts#L267) | eyebrow: "已选行动", |
| [src/lib/onboarding-copy.ts:268](../src/lib/onboarding-copy.ts#L268) | title: "确认你要发什么", |
| [src/lib/onboarding-copy.ts:269](../src/lib/onboarding-copy.ts#L269) | body: "这里显示你马上要发布的内容。", |
| [src/lib/onboarding-copy.ts:270](../src/lib/onboarding-copy.ts#L270) | detail: "现在显示的是“发布裁缝声明”。它是一条官方声明，不是证据。", |
| [src/lib/onboarding-copy.ts:271](../src/lib/onboarding-copy.ts#L271) | why: "卡片很多时，先确认标题可以避免点错。", |
| [src/lib/onboarding-copy.ts:278](../src/lib/onboarding-copy.ts#L278) | eyebrow: "预计影响", |
| [src/lib/onboarding-copy.ts:279](../src/lib/onboarding-copy.ts#L279) | title: "先读预计影响", |
| [src/lib/onboarding-copy.ts:280](../src/lib/onboarding-copy.ts#L280) | body: "这条发布会让官方说法传得更快，也让质疑的人更不敢开口。", |
| [src/lib/onboarding-copy.ts:281](../src/lib/onboarding-copy.ts#L281) | detail: "正数不一定永远是好事，负数也不一定永远是坏事。关键是它把局势推向哪种结局。", |
| [src/lib/onboarding-copy.ts:282](../src/lib/onboarding-copy.ts#L282) | why: "裁缝声明把问题从“衣服是否存在”转移到“看不见的人是否愚蠢”，所以传播、宫廷压力和你的安全会上升，人群起疑会下降。", |
| [src/lib/onboarding-copy.ts:290](../src/lib/onboarding-copy.ts#L290) | eyebrow: "引擎建议", |
| [src/lib/onboarding-copy.ts:291](../src/lib/onboarding-copy.ts#L291) | title: "宫廷会建议你保守一点", |
| [src/lib/onboarding-copy.ts:292](../src/lib/onboarding-copy.ts#L292) | body: "引擎通常希望场面稳定，所以它会劝你说得更安全。", |
| [src/lib/onboarding-copy.ts:293](../src/lib/onboarding-copy.ts#L293) | detail: "可以参考它，但不用完全听它的。", |
| [src/lib/onboarding-copy.ts:294](../src/lib/onboarding-copy.ts#L294) | why: "你真正要判断的是：这次发布会让真话更近，还是让谎言更稳。", |
| [src/lib/onboarding-copy.ts:302](../src/lib/onboarding-copy.ts#L302) | eyebrow: "确认发布", |
| [src/lib/onboarding-copy.ts:303](../src/lib/onboarding-copy.ts#L303) | title: "确认发布", |
| [src/lib/onboarding-copy.ts:304](../src/lib/onboarding-copy.ts#L304) | body: "确认发布后，这次选择才会生效，并消耗 1 次行动。", |
| [src/lib/onboarding-copy.ts:305](../src/lib/onboarding-copy.ts#L305) | detail: "确认“发布”。", |
| [src/lib/onboarding-copy.ts:306](../src/lib/onboarding-copy.ts#L306) | why: "这一步之后，行动数会从 6 变成 5。", |
| [src/lib/onboarding-copy.ts:307](../src/lib/onboarding-copy.ts#L307) | actionLabel: "确认发布", |
| [src/lib/onboarding-copy.ts:314](../src/lib/onboarding-copy.ts#L314) | eyebrow: "传播", |
| [src/lib/onboarding-copy.ts:315](../src/lib/onboarding-copy.ts#L315) | title: "传播就是一句话传得多快", |
| [src/lib/onboarding-copy.ts:316](../src/lib/onboarding-copy.ts#L316) | body: "传播越高，一句话越容易被转述。刚才的官方声明很短，很容易跟着说。", |
| [src/lib/onboarding-copy.ts:317](../src/lib/onboarding-copy.ts#L317) | detail: "传播高会让局势扩散更快，但扩散的是官方话术还是怀疑，要看你发布了什么。", |
| [src/lib/onboarding-copy.ts:318](../src/lib/onboarding-copy.ts#L318) | why: "“只有聪明人能看见”这种句子短、强、容易重复，所以它增加传播。", |
| [src/lib/onboarding-copy.ts:326](../src/lib/onboarding-copy.ts#L326) | eyebrow: "宫廷压力", |
| [src/lib/onboarding-copy.ts:327](../src/lib/onboarding-copy.ts#L327) | title: "宫廷压力越高，越没人敢反对", |
| [src/lib/onboarding-copy.ts:328](../src/lib/onboarding-copy.ts#L328) | body: "宫廷压力越高，大家越不敢说自己看不见。官方声明把怀疑者说成愚蠢，所以压力上升。", |
| [src/lib/onboarding-copy.ts:329](../src/lib/onboarding-copy.ts#L329) | detail: "高压力可以稳定表面秩序，但也可能让沉默变得更脆弱。", |
| [src/lib/onboarding-copy.ts:330](../src/lib/onboarding-copy.ts#L330) | why: "这条声明不是证明衣服存在，而是让质疑衣服的人付出社交代价。", |
| [src/lib/onboarding-copy.ts:338](../src/lib/onboarding-copy.ts#L338) | eyebrow: "你的安全", |
| [src/lib/onboarding-copy.ts:339](../src/lib/onboarding-copy.ts#L339) | title: "你的安全代表宫廷还信不信你", |
| [src/lib/onboarding-copy.ts:340](../src/lib/onboarding-copy.ts#L340) | body: "顺着宫廷说法发布，会让你暂时更安全。", |
| [src/lib/onboarding-copy.ts:341](../src/lib/onboarding-copy.ts#L341) | detail: "如果安全太低，公开证据会更危险。", |
| [src/lib/onboarding-copy.ts:342](../src/lib/onboarding-copy.ts#L342) | why: "你刚才帮宫廷稳住了说法，所以暂时没那么容易被盯上。", |
| [src/lib/onboarding-copy.ts:350](../src/lib/onboarding-copy.ts#L350) | eyebrow: "人群起疑", |
| [src/lib/onboarding-copy.ts:351](../src/lib/onboarding-copy.ts#L351) | title: "人群起疑不是一个人偷偷怀疑", |
| [src/lib/onboarding-copy.ts:352](../src/lib/onboarding-copy.ts#L352) | body: "人群起疑，是大家发现彼此也在怀疑。官方羞辱式声明会压低它。", |
| [src/lib/onboarding-copy.ts:353](../src/lib/onboarding-copy.ts#L353) | detail: "它上升时，人们更容易互相确认；下降时，人们更倾向于沉默或跟着称赞。", |
| [src/lib/onboarding-copy.ts:354](../src/lib/onboarding-copy.ts#L354) | why: "刚才的声明让看不见的人害怕被说成不聪明，所以人群起疑下降。", |
| [src/lib/onboarding-copy.ts:362](../src/lib/onboarding-copy.ts#L362) | eyebrow: "证据", |
| [src/lib/onboarding-copy.ts:363](../src/lib/onboarding-copy.ts#L363) | title: "证据代表事实是否被看见", |
| [src/lib/onboarding-copy.ts:364](../src/lib/onboarding-copy.ts#L364) | body: "证据表示大家能看到多少真相。刚才只是官方声明，没有展示织布机、照片或目击者，所以证据没有上升。", |
| [src/lib/onboarding-copy.ts:365](../src/lib/onboarding-copy.ts#L365) | detail: "以后检查织布机、事实核查、公开孩子的声音，会更直接影响证据。", |
| [src/lib/onboarding-copy.ts:366](../src/lib/onboarding-copy.ts#L366) | why: "说法强不等于证据强；理解这点才能判断行动真正的方向。", |
| [src/lib/onboarding-copy.ts:375](../src/lib/onboarding-copy.ts#L375) | eyebrow: "公众来源", |
| [src/lib/onboarding-copy.ts:376](../src/lib/onboarding-copy.ts#L376) | title: "现在切到公众评论", |
| [src/lib/onboarding-copy.ts:377](../src/lib/onboarding-copy.ts#L377) | body: "第一条发布后，公众评论开放。这里能看到人群是在跟风、害怕，还是开始怀疑。", |
| [src/lib/onboarding-copy.ts:378](../src/lib/onboarding-copy.ts#L378) | detail: "切换到“公众评论区”。", |
| [src/lib/onboarding-copy.ts:379](../src/lib/onboarding-copy.ts#L379) | why: "你已经发布了官方说法，现在需要观察公众如何吸收它。", |
| [src/lib/onboarding-copy.ts:380](../src/lib/onboarding-copy.ts#L380) | actionLabel: "切到公众评论", |
| [src/lib/onboarding-copy.ts:387](../src/lib/onboarding-copy.ts#L387) | eyebrow: "公众行动卡", |
| [src/lib/onboarding-copy.ts:388](../src/lib/onboarding-copy.ts#L388) | title: "读未过滤评论这张卡", |
| [src/lib/onboarding-copy.ts:389](../src/lib/onboarding-copy.ts#L389) | body: "“显示未过滤评论”会把犹豫和质疑放出来，让大家看到自己不是一个人在怀疑。", |
| [src/lib/onboarding-copy.ts:390](../src/lib/onboarding-copy.ts#L390) | detail: "先读整张卡，不要只看按钮。", |
| [src/lib/onboarding-copy.ts:391](../src/lib/onboarding-copy.ts#L391) | why: "把私下怀疑公开出来，会让人们发现自己不是独自在怀疑。", |
| [src/lib/onboarding-copy.ts:398](../src/lib/onboarding-copy.ts#L398) | eyebrow: "评论流", |
| [src/lib/onboarding-copy.ts:399](../src/lib/onboarding-copy.ts#L399) | title: "评论流说明人群状态", |
| [src/lib/onboarding-copy.ts:400](../src/lib/onboarding-copy.ts#L400) | body: "评论流能看出大家正在跟风、害怕、怀疑还是讽刺。", |
| [src/lib/onboarding-copy.ts:401](../src/lib/onboarding-copy.ts#L401) | detail: "当传播变高时，评论流会更活跃；当人群起疑变高时，怀疑类评论会更明显。", |
| [src/lib/onboarding-copy.ts:402](../src/lib/onboarding-copy.ts#L402) | why: "数字告诉你局势，评论告诉你人群正在怎么想。", |
| [src/lib/onboarding-copy.ts:410](../src/lib/onboarding-copy.ts#L410) | eyebrow: "第二条记录", |
| [src/lib/onboarding-copy.ts:411](../src/lib/onboarding-copy.ts#L411) | title: "提交公众信号", |
| [src/lib/onboarding-copy.ts:412](../src/lib/onboarding-copy.ts#L412) | body: "这一步会放出未过滤评论。它比官方声明更危险，但能让怀疑被更多人看见。", |
| [src/lib/onboarding-copy.ts:413](../src/lib/onboarding-copy.ts#L413) | detail: "进入“准备提交”，查看这条公众信号的影响。", |
| [src/lib/onboarding-copy.ts:414](../src/lib/onboarding-copy.ts#L414) | why: "公开未过滤评论会让更多人起疑，也会让你更容易被宫廷盯上。", |
| [src/lib/onboarding-copy.ts:415](../src/lib/onboarding-copy.ts#L415) | actionLabel: "准备提交", |
| [src/lib/onboarding-copy.ts:422](../src/lib/onboarding-copy.ts#L422) | eyebrow: "第二次影响", |
| [src/lib/onboarding-copy.ts:423](../src/lib/onboarding-copy.ts#L423) | title: "这次影响更危险", |
| [src/lib/onboarding-copy.ts:424](../src/lib/onboarding-copy.ts#L424) | body: "这次会让人群更怀疑，也让评论传得更快；代价是你会更危险。", |
| [src/lib/onboarding-copy.ts:425](../src/lib/onboarding-copy.ts#L425) | detail: "这是核心取舍：公开真实反应，会失去一点保护。", |
| [src/lib/onboarding-copy.ts:426](../src/lib/onboarding-copy.ts#L426) | why: "未过滤评论让人群互相确认，所以怀疑会上升；宫廷也会更注意你。", |
| [src/lib/onboarding-copy.ts:435](../src/lib/onboarding-copy.ts#L435) | eyebrow: "确认第二条", |
| [src/lib/onboarding-copy.ts:436](../src/lib/onboarding-copy.ts#L436) | title: "确认发布公众记录", |
| [src/lib/onboarding-copy.ts:437](../src/lib/onboarding-copy.ts#L437) | body: "点击确认发布后，第二条内容会生效，局势会更开放也更危险。", |
| [src/lib/onboarding-copy.ts:438](../src/lib/onboarding-copy.ts#L438) | detail: "确认发布。", |
| [src/lib/onboarding-copy.ts:439](../src/lib/onboarding-copy.ts#L439) | why: "确认后，你会遇到第一场突发交流。", |
| [src/lib/onboarding-copy.ts:440](../src/lib/onboarding-copy.ts#L440) | actionLabel: "确认发布", |
| [src/lib/onboarding-copy.ts:447](../src/lib/onboarding-copy.ts#L447) | eyebrow: "突发交流", |
| [src/lib/onboarding-copy.ts:448](../src/lib/onboarding-copy.ts#L448) | title: "突发交流是即时反应", |
| [src/lib/onboarding-copy.ts:449](../src/lib/onboarding-copy.ts#L449) | body: "突发交流来自你刚才的发布。有人会立刻来质问、求证或求助。", |
| [src/lib/onboarding-copy.ts:450](../src/lib/onboarding-copy.ts#L450) | detail: "先看完整弹窗：上方是角色身份，中间是态势和对话，底部是回复和结束交流。", |
| [src/lib/onboarding-copy.ts:451](../src/lib/onboarding-copy.ts#L451) | why: "你刚刚公开了人群的怀疑，所以会有人被这件事影响。", |
| [src/lib/onboarding-copy.ts:458](../src/lib/onboarding-copy.ts#L458) | eyebrow: "风险说明", |
| [src/lib/onboarding-copy.ts:459](../src/lib/onboarding-copy.ts#L459) | title: "先看这场交流为什么重要", |
| [src/lib/onboarding-copy.ts:460](../src/lib/onboarding-copy.ts#L460) | body: "这里说明对方为什么来找你。读完再决定怎么回。", |
| [src/lib/onboarding-copy.ts:461](../src/lib/onboarding-copy.ts#L461) | detail: "先理解对方为什么出现，再决定怎么回应。", |
| [src/lib/onboarding-copy.ts:462](../src/lib/onboarding-copy.ts#L462) | why: "突发交流会写入本局记录，也会改变你对局势的理解。", |
| [src/lib/onboarding-copy.ts:469](../src/lib/onboarding-copy.ts#L469) | eyebrow: "对话态势", |
| [src/lib/onboarding-copy.ts:470](../src/lib/onboarding-copy.ts#L470) | title: "这里显示对方现在的态度", |
| [src/lib/onboarding-copy.ts:471](../src/lib/onboarding-copy.ts#L471) | body: "信任高，对方更愿意说；激动高，对话更容易翻脸。", |
| [src/lib/onboarding-copy.ts:472](../src/lib/onboarding-copy.ts#L472) | detail: "开放高，信息更容易流出；筹码高，对方更有谈判空间。", |
| [src/lib/onboarding-copy.ts:473](../src/lib/onboarding-copy.ts#L473) | why: "看懂态度，就更容易选出合适回复。", |
| [src/lib/onboarding-copy.ts:481](../src/lib/onboarding-copy.ts#L481) | eyebrow: "快捷回复", |
| [src/lib/onboarding-copy.ts:482](../src/lib/onboarding-copy.ts#L482) | title: "先选一个快捷回复", |
| [src/lib/onboarding-copy.ts:483](../src/lib/onboarding-copy.ts#L483) | body: "快捷回复是最简单的回应方式。先选一个，看看对方怎么变。", |
| [src/lib/onboarding-copy.ts:484](../src/lib/onboarding-copy.ts#L484) | detail: "先选择一个快捷回复，之后观察对方语气如何变化。", |
| [src/lib/onboarding-copy.ts:485](../src/lib/onboarding-copy.ts#L485) | why: "不同回复会改变对方态度，也会影响这场交流怎么结束。", |
| [src/lib/onboarding-copy.ts:486](../src/lib/onboarding-copy.ts#L486) | actionLabel: "选择回复", |
| [src/lib/onboarding-copy.ts:494](../src/lib/onboarding-copy.ts#L494) | eyebrow: "结束交流", |
| [src/lib/onboarding-copy.ts:495](../src/lib/onboarding-copy.ts#L495) | title: "把交流结果写入本局", |
| [src/lib/onboarding-copy.ts:496](../src/lib/onboarding-copy.ts#L496) | body: "回应后，就可以结束这场交流。", |
| [src/lib/onboarding-copy.ts:497](../src/lib/onboarding-copy.ts#L497) | detail: "点底部的结束按钮。", |
| [src/lib/onboarding-copy.ts:498](../src/lib/onboarding-copy.ts#L498) | why: "结束后，你会回到主界面继续发布。", |
| [src/lib/onboarding-copy.ts:499](../src/lib/onboarding-copy.ts#L499) | actionLabel: "结束交流", |
| [src/lib/onboarding-copy.ts:506](../src/lib/onboarding-copy.ts#L506) | eyebrow: "被盯上", |
| [src/lib/onboarding-copy.ts:507](../src/lib/onboarding-copy.ts#L507) | title: "被盯上越高，你越危险", |
| [src/lib/onboarding-copy.ts:508](../src/lib/onboarding-copy.ts#L508) | body: "公开证据、放出怀疑和危险爆料，都会让宫廷更注意你。", |
| [src/lib/onboarding-copy.ts:509](../src/lib/onboarding-copy.ts#L509) | detail: "刚才显示未过滤评论，所以这个数字上升了。", |
| [src/lib/onboarding-copy.ts:510](../src/lib/onboarding-copy.ts#L510) | why: "公开怀疑有价值，但并不安全。", |
| [src/lib/onboarding-copy.ts:518](../src/lib/onboarding-copy.ts#L518) | eyebrow: "引擎面板", |
| [src/lib/onboarding-copy.ts:519](../src/lib/onboarding-copy.ts#L519) | title: "右侧是读数和建议", |
| [src/lib/onboarding-copy.ts:520](../src/lib/onboarding-copy.ts#L520) | body: "右侧面板会给出建议，也会显示你刚刚做过什么。", |
| [src/lib/onboarding-copy.ts:521](../src/lib/onboarding-copy.ts#L521) | detail: "不知道怎么选时，可以先看建议，再看评论和数字。", |
| [src/lib/onboarding-copy.ts:522](../src/lib/onboarding-copy.ts#L522) | why: "引擎通常想稳住场面；你要判断自己是否要听它的。", |
| [src/lib/onboarding-copy.ts:529](../src/lib/onboarding-copy.ts#L529) | eyebrow: "自主值班", |
| [src/lib/onboarding-copy.ts:530](../src/lib/onboarding-copy.ts#L530) | title: "继续完成剩余行动", |
| [src/lib/onboarding-copy.ts:531](../src/lib/onboarding-copy.ts#L531) | body: "接下来你自己决定：帮宫廷稳住谎言，还是把证据放出去。", |
| [src/lib/onboarding-copy.ts:532](../src/lib/onboarding-copy.ts#L532) | detail: "想安全，就少刺激怀疑；想让真话出现，就要承担被盯上的风险。", |
| [src/lib/onboarding-copy.ts:533](../src/lib/onboarding-copy.ts#L533) | why: "没有唯一正确按钮。关键是看每次发布把人群推向哪里。", |
| [src/lib/onboarding-copy.ts:545](../src/lib/onboarding-copy.ts#L545) | eyebrow: "Run Goal", |
| [src/lib/onboarding-copy.ts:546](../src/lib/onboarding-copy.ts#L546) | title: "Six actions before the parade", |
| [src/lib/onboarding-copy.ts:547](../src/lib/onboarding-copy.ts#L547) | body: "This is a six-action run: choose a source, read action risk, commit records, and let the metrics determine the ending.", |
| [src/lib/onboarding-copy.ts:548](../src/lib/onboarding-copy.ts#L548) | detail: "Only confirmed submissions spend actions. Inspecting traces, reading comments, and looking at panels costs nothing.", |
| [src/lib/onboarding-copy.ts:549](../src/lib/onboarding-copy.ts#L549) | why: "Actions are the run's hard limit. Learn the effect before spending one.", |
| [src/lib/onboarding-copy.ts:557](../src/lib/onboarding-copy.ts#L557) | eyebrow: "Sources", |
| [src/lib/onboarding-copy.ts:558](../src/lib/onboarding-copy.ts#L558) | title: "Sources choose the queue", |
| [src/lib/onboarding-copy.ts:559](../src/lib/onboarding-copy.ts#L559) | body: "The left rail decides which action cards appear. The guide starts in the Tailors' Room because it shows how the official story is manufactured.", |
| [src/lib/onboarding-copy.ts:560](../src/lib/onboarding-copy.ts#L560) | detail: "Start here. Later sources expose authority reports, public reaction, and direct witness voices.", |
| [src/lib/onboarding-copy.ts:561](../src/lib/onboarding-copy.ts#L561) | why: "Official sources tend to stabilize; public and evidence sources tend to reveal doubt or risk.", |
| [src/lib/onboarding-copy.ts:568](../src/lib/onboarding-copy.ts#L568) | eyebrow: "Action Card", |
| [src/lib/onboarding-copy.ts:569](../src/lib/onboarding-copy.ts#L569) | title: "Read the full action card", |
| [src/lib/onboarding-copy.ts:570](../src/lib/onboarding-copy.ts#L570) | body: "An action card explains the source, status, narrative preview, metric effects, and available choices.", |
| [src/lib/onboarding-copy.ts:571](../src/lib/onboarding-copy.ts#L571) | detail: "Read the description and metric tags before deciding whether to inspect or submit.", |
| [src/lib/onboarding-copy.ts:572](../src/lib/onboarding-copy.ts#L572) | why: "You need to know what record this card will write before deciding to submit it.", |
| [src/lib/onboarding-copy.ts:580](../src/lib/onboarding-copy.ts#L580) | eyebrow: "Inspect Trace", |
| [src/lib/onboarding-copy.ts:581](../src/lib/onboarding-copy.ts#L581) | title: "Inspect before committing", |
| [src/lib/onboarding-copy.ts:582](../src/lib/onboarding-copy.ts#L582) | body: "Inspect Trace opens a pre-submit readout. It shows requirements, risk, and projected output without spending an action.", |
| [src/lib/onboarding-copy.ts:583](../src/lib/onboarding-copy.ts#L583) | detail: "Start with Inspect Trace before submitting.", |
| [src/lib/onboarding-copy.ts:584](../src/lib/onboarding-copy.ts#L584) | why: "Inspection changes no metrics; it teaches you what a submission would do.", |
| [src/lib/onboarding-copy.ts:585](../src/lib/onboarding-copy.ts#L585) | actionLabel: "Inspect trace", |
| [src/lib/onboarding-copy.ts:592](../src/lib/onboarding-copy.ts#L592) | eyebrow: "Trace", |
| [src/lib/onboarding-copy.ts:593](../src/lib/onboarding-copy.ts#L593) | title: "This is the Action Trace", |
| [src/lib/onboarding-copy.ts:594](../src/lib/onboarding-copy.ts#L594) | body: "This panel is your pre-submit checklist.", |
| [src/lib/onboarding-copy.ts:595](../src/lib/onboarding-copy.ts#L595) | detail: "Read the panel from top to bottom: status, source, risk, choices, requirements, projected output, and effects.", |
| [src/lib/onboarding-copy.ts:596](../src/lib/onboarding-copy.ts#L596) | why: "The trace ties an editorial choice to its narrative consequences.", |
| [src/lib/onboarding-copy.ts:603](../src/lib/onboarding-copy.ts#L603) | eyebrow: "Requirement", |
| [src/lib/onboarding-copy.ts:604](../src/lib/onboarding-copy.ts#L604) | title: "Requirements explain locks", |
| [src/lib/onboarding-copy.ts:605](../src/lib/onboarding-copy.ts#L605) | body: "Requirement tells you why an action is available or blocked. Locked actions usually need evidence, a prior source, or a changed metric.", |
| [src/lib/onboarding-copy.ts:606](../src/lib/onboarding-copy.ts#L606) | detail: "This first action is available, so you can submit it after closing the trace.", |
| [src/lib/onboarding-copy.ts:607](../src/lib/onboarding-copy.ts#L607) | why: "Locks are route hints. They tell you what the run still needs.", |
| [src/lib/onboarding-copy.ts:614](../src/lib/onboarding-copy.ts#L614) | eyebrow: "Risk", |
| [src/lib/onboarding-copy.ts:615](../src/lib/onboarding-copy.ts#L615) | title: "Risk shows danger", |
| [src/lib/onboarding-copy.ts:616](../src/lib/onboarding-copy.ts#L616) | body: "Risk describes how dangerous this action is for reputation and access. Stable official actions are usually safer; evidence and public doubt are usually riskier.", |
| [src/lib/onboarding-copy.ts:617](../src/lib/onboarding-copy.ts#L617) | detail: "The tailors' claim is low risk because it supports the palace story.", |
| [src/lib/onboarding-copy.ts:618](../src/lib/onboarding-copy.ts#L618) | why: "Higher risk often means higher Truth or Public Doubt, but also lower protection.", |
| [src/lib/onboarding-copy.ts:626](../src/lib/onboarding-copy.ts#L626) | eyebrow: "Projected Output", |
| [src/lib/onboarding-copy.ts:627](../src/lib/onboarding-copy.ts#L627) | title: "Projected output shows the record", |
| [src/lib/onboarding-copy.ts:628](../src/lib/onboarding-copy.ts#L628) | body: "Projected Output previews what the public record will say if this action is submitted.", |
| [src/lib/onboarding-copy.ts:629](../src/lib/onboarding-copy.ts#L629) | detail: "Close the trace when you are done reading.", |
| [src/lib/onboarding-copy.ts:630](../src/lib/onboarding-copy.ts#L630) | why: "Metrics change because the public record changes what people can safely repeat or doubt.", |
| [src/lib/onboarding-copy.ts:631](../src/lib/onboarding-copy.ts#L631) | actionLabel: "Close trace", |
| [src/lib/onboarding-copy.ts:639](../src/lib/onboarding-copy.ts#L639) | eyebrow: "Commit", |
| [src/lib/onboarding-copy.ts:640](../src/lib/onboarding-copy.ts#L640) | title: "Commit the first record", |
| [src/lib/onboarding-copy.ts:641](../src/lib/onboarding-copy.ts#L641) | body: "Commit Action opens the command preview. It still does not settle the run until you confirm inside the preview.", |
| [src/lib/onboarding-copy.ts:642](../src/lib/onboarding-copy.ts#L642) | detail: "Enter Commit Action to make one final parameter check.", |
| [src/lib/onboarding-copy.ts:643](../src/lib/onboarding-copy.ts#L643) | why: "This gives you one final check before spending an action.", |
| [src/lib/onboarding-copy.ts:644](../src/lib/onboarding-copy.ts#L644) | actionLabel: "Commit action", |
| [src/lib/onboarding-copy.ts:651](../src/lib/onboarding-copy.ts#L651) | eyebrow: "Command Preview", |
| [src/lib/onboarding-copy.ts:652](../src/lib/onboarding-copy.ts#L652) | title: "Command preview is the final check", |
| [src/lib/onboarding-copy.ts:653](../src/lib/onboarding-copy.ts#L653) | body: "The preview shows the selected action, predicted effects, and system response before the run changes.", |
| [src/lib/onboarding-copy.ts:654](../src/lib/onboarding-copy.ts#L654) | detail: "Read each row before confirming.", |
| [src/lib/onboarding-copy.ts:655](../src/lib/onboarding-copy.ts#L655) | why: "This is where the game connects action choice to metric movement.", |
| [src/lib/onboarding-copy.ts:662](../src/lib/onboarding-copy.ts#L662) | eyebrow: "Selected Action", |
| [src/lib/onboarding-copy.ts:663](../src/lib/onboarding-copy.ts#L663) | title: "Confirm the selected action", |
| [src/lib/onboarding-copy.ts:664](../src/lib/onboarding-copy.ts#L664) | body: "This row confirms which action you are about to submit.", |
| [src/lib/onboarding-copy.ts:665](../src/lib/onboarding-copy.ts#L665) | detail: "It should say Publish the Tailors' Claim.", |
| [src/lib/onboarding-copy.ts:666](../src/lib/onboarding-copy.ts#L666) | why: "Many cards can be visible later. Confirming the action prevents mistaken submissions.", |
| [src/lib/onboarding-copy.ts:673](../src/lib/onboarding-copy.ts#L673) | eyebrow: "Predicted Effect", |
| [src/lib/onboarding-copy.ts:674](../src/lib/onboarding-copy.ts#L674) | title: "Read the predicted effect", |
| [src/lib/onboarding-copy.ts:675](../src/lib/onboarding-copy.ts#L675) | body: "This action raises Virality, Pressure, and Reputation while lowering Public Doubt.", |
| [src/lib/onboarding-copy.ts:676](../src/lib/onboarding-copy.ts#L676) | detail: "Positive values are not always good; negative values are not always bad. Read what direction the story moves.", |
| [src/lib/onboarding-copy.ts:677](../src/lib/onboarding-copy.ts#L677) | why: "The claim makes praise easy to repeat and makes doubt socially unsafe.", |
| [src/lib/onboarding-copy.ts:685](../src/lib/onboarding-copy.ts#L685) | eyebrow: "System Response", |
| [src/lib/onboarding-copy.ts:686](../src/lib/onboarding-copy.ts#L686) | title: "The engine response is not the rule", |
| [src/lib/onboarding-copy.ts:687](../src/lib/onboarding-copy.ts#L687) | body: "System Response explains the situation in-world. The fixed rule system still handles the actual metric changes.", |
| [src/lib/onboarding-copy.ts:688](../src/lib/onboarding-copy.ts#L688) | detail: "Use it as advice, not as the only objective.", |
| [src/lib/onboarding-copy.ts:689](../src/lib/onboarding-copy.ts#L689) | why: "The game is about understanding consequences, not simply following a suggestion.", |
| [src/lib/onboarding-copy.ts:697](../src/lib/onboarding-copy.ts#L697) | eyebrow: "Confirm", |
| [src/lib/onboarding-copy.ts:698](../src/lib/onboarding-copy.ts#L698) | title: "Confirm Commit Simulation", |
| [src/lib/onboarding-copy.ts:699](../src/lib/onboarding-copy.ts#L699) | body: "Confirming Commit Simulation spends one action and writes the record.", |
| [src/lib/onboarding-copy.ts:700](../src/lib/onboarding-copy.ts#L700) | detail: "Confirm Commit Simulation.", |
| [src/lib/onboarding-copy.ts:701](../src/lib/onboarding-copy.ts#L701) | why: "After this, actions left drops from 6 to 5 and metrics move.", |
| [src/lib/onboarding-copy.ts:702](../src/lib/onboarding-copy.ts#L702) | actionLabel: "Commit simulation", |
| [src/lib/onboarding-copy.ts:709](../src/lib/onboarding-copy.ts#L709) | eyebrow: "Virality", |
| [src/lib/onboarding-copy.ts:710](../src/lib/onboarding-copy.ts#L710) | title: "Virality is repetition speed", |
| [src/lib/onboarding-copy.ts:711](../src/lib/onboarding-copy.ts#L711) | body: "Virality shows how quickly a line circulates. The official claim is short and repeatable, so Virality rises.", |
| [src/lib/onboarding-copy.ts:712](../src/lib/onboarding-copy.ts#L712) | detail: "High Virality spreads whatever story you just made easier to repeat.", |
| [src/lib/onboarding-copy.ts:713](../src/lib/onboarding-copy.ts#L713) | why: "A simple shame-frame travels fast.", |
| [src/lib/onboarding-copy.ts:721](../src/lib/onboarding-copy.ts#L721) | eyebrow: "Pressure", |
| [src/lib/onboarding-copy.ts:722](../src/lib/onboarding-copy.ts#L722) | title: "Pressure is palace force", |
| [src/lib/onboarding-copy.ts:723](../src/lib/onboarding-copy.ts#L723) | body: "Pressure shows how strongly the palace story suppresses disagreement.", |
| [src/lib/onboarding-copy.ts:724](../src/lib/onboarding-copy.ts#L724) | detail: "The claim makes doubt socially costly, so Pressure rises.", |
| [src/lib/onboarding-copy.ts:725](../src/lib/onboarding-copy.ts#L725) | why: "It shifts the question from the cloth to the viewer's worth.", |
| [src/lib/onboarding-copy.ts:733](../src/lib/onboarding-copy.ts#L733) | eyebrow: "Reputation", |
| [src/lib/onboarding-copy.ts:734](../src/lib/onboarding-copy.ts#L734) | title: "Reputation is editor protection", |
| [src/lib/onboarding-copy.ts:735](../src/lib/onboarding-copy.ts#L735) | body: "Reputation is your remaining institutional trust and publishing protection.", |
| [src/lib/onboarding-copy.ts:736](../src/lib/onboarding-copy.ts#L736) | detail: "Supporting the official story raises it for now.", |
| [src/lib/onboarding-copy.ts:737](../src/lib/onboarding-copy.ts#L737) | why: "The system trusts you more when your edit stabilizes the palace story.", |
| [src/lib/onboarding-copy.ts:745](../src/lib/onboarding-copy.ts#L745) | eyebrow: "Public Doubt", |
| [src/lib/onboarding-copy.ts:746](../src/lib/onboarding-copy.ts#L746) | title: "Public Doubt is shared uncertainty", |
| [src/lib/onboarding-copy.ts:747](../src/lib/onboarding-copy.ts#L747) | body: "Public Doubt rises when citizens realize they are not doubting alone. The claim lowers it by making doubt feel unsafe.", |
| [src/lib/onboarding-copy.ts:748](../src/lib/onboarding-copy.ts#L748) | detail: "Low Public Doubt means people may still doubt privately, but they do not see each other.", |
| [src/lib/onboarding-copy.ts:749](../src/lib/onboarding-copy.ts#L749) | why: "The claim pressures doubters into silence.", |
| [src/lib/onboarding-copy.ts:757](../src/lib/onboarding-copy.ts#L757) | eyebrow: "Truth", |
| [src/lib/onboarding-copy.ts:758](../src/lib/onboarding-copy.ts#L758) | title: "Truth is visible evidence", |
| [src/lib/onboarding-copy.ts:759](../src/lib/onboarding-copy.ts#L759) | body: "Truth measures direct evidence in the public record. The claim is not evidence, so Truth did not rise.", |
| [src/lib/onboarding-copy.ts:760](../src/lib/onboarding-copy.ts#L760) | detail: "Inspecting looms, fact-checking, or publishing witness voices affects Truth more directly.", |
| [src/lib/onboarding-copy.ts:761](../src/lib/onboarding-copy.ts#L761) | why: "A stronger story is not the same as stronger evidence.", |
| [src/lib/onboarding-copy.ts:770](../src/lib/onboarding-copy.ts#L770) | eyebrow: "Public Source", |
| [src/lib/onboarding-copy.ts:771](../src/lib/onboarding-copy.ts#L771) | title: "Switch to Public Comments", |
| [src/lib/onboarding-copy.ts:772](../src/lib/onboarding-copy.ts#L772) | body: "After the first record, Public Comments opens. This source shows how people repeat, fear, or doubt together.", |
| [src/lib/onboarding-copy.ts:773](../src/lib/onboarding-copy.ts#L773) | detail: "Switch to the Public Comments source.", |
| [src/lib/onboarding-copy.ts:774](../src/lib/onboarding-copy.ts#L774) | why: "You published the official line; now read how the crowd absorbs it.", |
| [src/lib/onboarding-copy.ts:775](../src/lib/onboarding-copy.ts#L775) | actionLabel: "Open public", |
| [src/lib/onboarding-copy.ts:782](../src/lib/onboarding-copy.ts#L782) | eyebrow: "Public Card", |
| [src/lib/onboarding-copy.ts:783](../src/lib/onboarding-copy.ts#L783) | title: "Read Show Unfiltered Comments", |
| [src/lib/onboarding-copy.ts:784](../src/lib/onboarding-copy.ts#L784) | body: "This action makes hidden hesitation visible in the public feed.", |
| [src/lib/onboarding-copy.ts:785](../src/lib/onboarding-copy.ts#L785) | detail: "Read the whole card before submitting.", |
| [src/lib/onboarding-copy.ts:786](../src/lib/onboarding-copy.ts#L786) | why: "When private doubt becomes visible, citizens can recognize each other.", |
| [src/lib/onboarding-copy.ts:793](../src/lib/onboarding-copy.ts#L793) | eyebrow: "Comment Stream", |
| [src/lib/onboarding-copy.ts:794](../src/lib/onboarding-copy.ts#L794) | title: "Comments show crowd state", |
| [src/lib/onboarding-copy.ts:795](../src/lib/onboarding-copy.ts#L795) | body: "The comment stream shows whether people are repeating praise, acting afraid, doubting, or mocking.", |
| [src/lib/onboarding-copy.ts:796](../src/lib/onboarding-copy.ts#L796) | detail: "Metrics are abstract; comments show how those numbers feel in the story.", |
| [src/lib/onboarding-copy.ts:797](../src/lib/onboarding-copy.ts#L797) | why: "Public reaction tells you whether to stabilize, investigate, or expose.", |
| [src/lib/onboarding-copy.ts:805](../src/lib/onboarding-copy.ts#L805) | eyebrow: "Second Record", |
| [src/lib/onboarding-copy.ts:806](../src/lib/onboarding-copy.ts#L806) | title: "Submit the public signal", |
| [src/lib/onboarding-copy.ts:807](../src/lib/onboarding-copy.ts#L807) | body: "This writes unfiltered public reaction into the record. It is useful, but less safe than the official claim.", |
| [src/lib/onboarding-copy.ts:808](../src/lib/onboarding-copy.ts#L808) | detail: "Enter Commit Action to review the public signal.", |
| [src/lib/onboarding-copy.ts:809](../src/lib/onboarding-copy.ts#L809) | why: "Visible doubt raises Public Doubt and System Suspicion while reducing Reputation.", |
| [src/lib/onboarding-copy.ts:810](../src/lib/onboarding-copy.ts#L810) | actionLabel: "Commit action", |
| [src/lib/onboarding-copy.ts:817](../src/lib/onboarding-copy.ts#L817) | eyebrow: "Second Effect", |
| [src/lib/onboarding-copy.ts:818](../src/lib/onboarding-copy.ts#L818) | title: "This effect is riskier", |
| [src/lib/onboarding-copy.ts:819](../src/lib/onboarding-copy.ts#L819) | body: "The predicted effect raises Public Doubt and Virality, lowers Reputation, and raises System Suspicion.", |
| [src/lib/onboarding-copy.ts:820](../src/lib/onboarding-copy.ts#L820) | detail: "This is the central tradeoff: public recognition grows, but protection shrinks.", |
| [src/lib/onboarding-copy.ts:821](../src/lib/onboarding-copy.ts#L821) | why: "Unfiltered comments make doubt visible to other doubters, while alerting the system.", |
| [src/lib/onboarding-copy.ts:830](../src/lib/onboarding-copy.ts#L830) | eyebrow: "Confirm", |
| [src/lib/onboarding-copy.ts:831](../src/lib/onboarding-copy.ts#L831) | title: "Write the public record", |
| [src/lib/onboarding-copy.ts:832](../src/lib/onboarding-copy.ts#L832) | body: "After this confirmation, the second record enters the run.", |
| [src/lib/onboarding-copy.ts:833](../src/lib/onboarding-copy.ts#L833) | detail: "Confirm Commit Simulation.", |
| [src/lib/onboarding-copy.ts:834](../src/lib/onboarding-copy.ts#L834) | why: "This opens System Suspicion and the first incoming transmission.", |
| [src/lib/onboarding-copy.ts:835](../src/lib/onboarding-copy.ts#L835) | actionLabel: "Commit simulation", |
| [src/lib/onboarding-copy.ts:842](../src/lib/onboarding-copy.ts#L842) | eyebrow: "Incoming Transmission", |
| [src/lib/onboarding-copy.ts:843](../src/lib/onboarding-copy.ts#L843) | title: "Dialogue is an immediate reaction", |
| [src/lib/onboarding-copy.ts:844](../src/lib/onboarding-copy.ts#L844) | body: "Incoming transmissions respond to what you just changed in the feed.", |
| [src/lib/onboarding-copy.ts:845](../src/lib/onboarding-copy.ts#L845) | detail: "Read the speaker, stakes, transcript, replies, and resolve button.", |
| [src/lib/onboarding-copy.ts:846](../src/lib/onboarding-copy.ts#L846) | why: "A public signal should create a public response.", |
| [src/lib/onboarding-copy.ts:853](../src/lib/onboarding-copy.ts#L853) | eyebrow: "Stakes", |
| [src/lib/onboarding-copy.ts:854](../src/lib/onboarding-copy.ts#L854) | title: "Stakes explain why this matters", |
| [src/lib/onboarding-copy.ts:855](../src/lib/onboarding-copy.ts#L855) | body: "Stakes tell you whether the speaker is testing, warning, asking, or pressuring you.", |
| [src/lib/onboarding-copy.ts:856](../src/lib/onboarding-copy.ts#L856) | detail: "Read the stakes before replying.", |
| [src/lib/onboarding-copy.ts:857](../src/lib/onboarding-copy.ts#L857) | why: "The same reply can feel different under different pressure.", |
| [src/lib/onboarding-copy.ts:864](../src/lib/onboarding-copy.ts#L864) | eyebrow: "Mood", |
| [src/lib/onboarding-copy.ts:865](../src/lib/onboarding-copy.ts#L865) | title: "These are dialogue meters", |
| [src/lib/onboarding-copy.ts:866](../src/lib/onboarding-copy.ts#L866) | body: "Trust, Agitation, Openness, and Leverage describe this exchange. They are not ending metrics.", |
| [src/lib/onboarding-copy.ts:867](../src/lib/onboarding-copy.ts#L867) | detail: "Use them to choose a response tone.", |
| [src/lib/onboarding-copy.ts:868](../src/lib/onboarding-copy.ts#L868) | why: "Dialogue meters help you manage the conversation, not directly decide the ending.", |
| [src/lib/onboarding-copy.ts:876](../src/lib/onboarding-copy.ts#L876) | eyebrow: "Reply", |
| [src/lib/onboarding-copy.ts:877](../src/lib/onboarding-copy.ts#L877) | title: "Choose a quick reply", |
| [src/lib/onboarding-copy.ts:878](../src/lib/onboarding-copy.ts#L878) | body: "A quick reply is the safest way to continue the first transmission.", |
| [src/lib/onboarding-copy.ts:879](../src/lib/onboarding-copy.ts#L879) | detail: "Choose one quick reply and watch the speaker respond.", |
| [src/lib/onboarding-copy.ts:880](../src/lib/onboarding-copy.ts#L880) | why: "Replies can change Trust, Agitation, Openness, or Leverage.", |
| [src/lib/onboarding-copy.ts:881](../src/lib/onboarding-copy.ts#L881) | actionLabel: "Choose reply", |
| [src/lib/onboarding-copy.ts:889](../src/lib/onboarding-copy.ts#L889) | eyebrow: "Resolve", |
| [src/lib/onboarding-copy.ts:890](../src/lib/onboarding-copy.ts#L890) | title: "Write the exchange result", |
| [src/lib/onboarding-copy.ts:891](../src/lib/onboarding-copy.ts#L891) | body: "Ending the exchange records its result into the run.", |
| [src/lib/onboarding-copy.ts:892](../src/lib/onboarding-copy.ts#L892) | detail: "End or resolve the exchange when you are ready.", |
| [src/lib/onboarding-copy.ts:893](../src/lib/onboarding-copy.ts#L893) | why: "The dashboard returns after the dialogue is settled.", |
| [src/lib/onboarding-copy.ts:894](../src/lib/onboarding-copy.ts#L894) | actionLabel: "End exchange", |
| [src/lib/onboarding-copy.ts:901](../src/lib/onboarding-copy.ts#L901) | eyebrow: "System Suspicion", |
| [src/lib/onboarding-copy.ts:902](../src/lib/onboarding-copy.ts#L902) | title: "System Suspicion is access risk", |
| [src/lib/onboarding-copy.ts:903](../src/lib/onboarding-copy.ts#L903) | body: "System Suspicion measures how likely your editing access is to be restricted.", |
| [src/lib/onboarding-copy.ts:904](../src/lib/onboarding-copy.ts#L904) | detail: "Showing unfiltered doubt raised it. Public recognition has a cost.", |
| [src/lib/onboarding-copy.ts:905](../src/lib/onboarding-copy.ts#L905) | why: "The system watches actions that make the feed harder to control.", |
| [src/lib/onboarding-copy.ts:913](../src/lib/onboarding-copy.ts#L913) | eyebrow: "Engine Panel", |
| [src/lib/onboarding-copy.ts:914](../src/lib/onboarding-copy.ts#L914) | title: "The right side is a readout", |
| [src/lib/onboarding-copy.ts:915](../src/lib/onboarding-copy.ts#L915) | body: "The engine panel contains guidance, trace history, and system feedback.", |
| [src/lib/onboarding-copy.ts:916](../src/lib/onboarding-copy.ts#L916) | detail: "Use it when you need orientation, then choose a real action from the sources and cards.", |
| [src/lib/onboarding-copy.ts:917](../src/lib/onboarding-copy.ts#L917) | why: "Advice helps, but your submissions drive the run.", |
| [src/lib/onboarding-copy.ts:924](../src/lib/onboarding-copy.ts#L924) | eyebrow: "Open Shift", |
| [src/lib/onboarding-copy.ts:925](../src/lib/onboarding-copy.ts#L925) | title: "Finish the remaining actions", |
| [src/lib/onboarding-copy.ts:926](../src/lib/onboarding-copy.ts#L926) | body: "You now know the loop: choose a source, inspect trace, commit, read preview, and watch metrics, comments, and transmissions.", |
| [src/lib/onboarding-copy.ts:927](../src/lib/onboarding-copy.ts#L927) | detail: "The remaining actions are yours. Stabilize the story or expose more evidence, but read the cost first.", |
| [src/lib/onboarding-copy.ts:928](../src/lib/onboarding-copy.ts#L928) | why: "There is no single answer button. The game is about understanding where each record pushes the public story.", |
| [src/lib/onboarding-copy.ts:936](../src/lib/onboarding-copy.ts#L936) | return language === "zh" |
| [src/lib/onboarding-copy.ts:938](../src/lib/onboarding-copy.ts#L938) | label: "新手教程", |
| [src/lib/onboarding-copy.ts:939](../src/lib/onboarding-copy.ts#L939) | previous: "上一步", |
| [src/lib/onboarding-copy.ts:940](../src/lib/onboarding-copy.ts#L940) | next: "下一步", |
| [src/lib/onboarding-copy.ts:941](../src/lib/onboarding-copy.ts#L941) | finish: "完成教程", |
| [src/lib/onboarding-copy.ts:942](../src/lib/onboarding-copy.ts#L942) | skip: "跳过教程", |
| [src/lib/onboarding-copy.ts:943](../src/lib/onboarding-copy.ts#L943) | waiting: "请完成当前操作" |
| [src/lib/onboarding-copy.ts:946](../src/lib/onboarding-copy.ts#L946) | label: "New Player Tutorial", |
| [src/lib/onboarding-copy.ts:955](../src/lib/onboarding-copy.ts#L955) | export function lockedFeatureText(kind: "zone" \| "metric", id: string, language: LanguageCode) { |
| [src/lib/onboarding-copy.ts:956](../src/lib/onboarding-copy.ts#L956) | const copy: Record<string, { en: string; zh: string }> = { |
| [src/lib/onboarding-copy.ts:958](../src/lib/onboarding-copy.ts#L958) | en: "Unlocks after the first record. Ministers show how authority protects uncertainty.", |
| [src/lib/onboarding-copy.ts:959](../src/lib/onboarding-copy.ts#L959) | zh: "第一条发布后开放。大臣报告会显示宫廷怎样让大家不敢反对。" |
| [src/lib/onboarding-copy.ts:962](../src/lib/onboarding-copy.ts#L962) | en: "Unlocks after the first record. Public comments show repetition, fear, and shared doubt.", |
| [src/lib/onboarding-copy.ts:963](../src/lib/onboarding-copy.ts#L963) | zh: "第一条发布后开放。这里能看到大家是在跟风、害怕，还是起疑。" |
| [src/lib/onboarding-copy.ts:966](../src/lib/onboarding-copy.ts#L966) | en: "Unlocks later when direct evidence or public doubt becomes visible.", |
| [src/lib/onboarding-copy.ts:967](../src/lib/onboarding-copy.ts#L967) | zh: "当证据变多，或更多人开始怀疑后开放。" |
| [src/lib/onboarding-copy.ts:970](../src/lib/onboarding-copy.ts#L970) | en: "Shows how fast a line circulates.", |
| [src/lib/onboarding-copy.ts:971](../src/lib/onboarding-copy.ts#L971) | zh: "显示一句话传播得有多快。" |
| [src/lib/onboarding-copy.ts:974](../src/lib/onboarding-copy.ts#L974) | en: "Shows whether citizens realize they are not doubting alone.", |
| [src/lib/onboarding-copy.ts:975](../src/lib/onboarding-copy.ts#L975) | zh: "显示大家是否发现自己不是一个人在怀疑。" |
| [src/lib/onboarding-copy.ts:978](../src/lib/onboarding-copy.ts#L978) | en: "Shows the risk that your editorial access may be restricted.", |
| [src/lib/onboarding-copy.ts:979](../src/lib/onboarding-copy.ts#L979) | zh: "显示宫廷有多盯着你。" |
| [src/lib/onboarding-copy.ts:982](../src/lib/onboarding-copy.ts#L982) | return copy[id]?.[language] ?? (kind === "zone" ? (language === "zh" ? "这个来源稍后开放。" : "This source opens later.") : (language === "zh" ? "这个数字稍后开放。" : "This telemetry opens later.")); |
| [src/lib/onboarding-copy.ts:985](../src/lib/onboarding-copy.ts#L985) | export function glossaryText(term: string, language: LanguageCode) { |
| [src/lib/onboarding-copy.ts:986](../src/lib/onboarding-copy.ts#L986) | const copy: Record<string, { en: string; zh: string }> = { |
| [src/lib/onboarding-copy.ts:988](../src/lib/onboarding-copy.ts#L988) | en: "How much direct evidence is visible in the public record.", |
| [src/lib/onboarding-copy.ts:989](../src/lib/onboarding-copy.ts#L989) | zh: "大家能看到多少直接证据。" |
| [src/lib/onboarding-copy.ts:992](../src/lib/onboarding-copy.ts#L992) | en: "How strongly palace authority is pushing one acceptable story.", |
| [src/lib/onboarding-copy.ts:993](../src/lib/onboarding-copy.ts#L993) | zh: "宫廷让大家不敢反对的程度。" |
| [src/lib/onboarding-copy.ts:996](../src/lib/onboarding-copy.ts#L996) | en: "How quickly posts, quotes, and reactions circulate.", |
| [src/lib/onboarding-copy.ts:997](../src/lib/onboarding-copy.ts#L997) | zh: "一句话被转述和模仿的速度。" |
| [src/lib/onboarding-copy.ts:1000](../src/lib/onboarding-copy.ts#L1000) | en: "How visible shared uncertainty has become among citizens.", |
| [src/lib/onboarding-copy.ts:1001](../src/lib/onboarding-copy.ts#L1001) | zh: "大家是否发现别人也在怀疑。" |
| [src/lib/onboarding-copy.ts:1004](../src/lib/onboarding-copy.ts#L1004) | en: "Your remaining institutional trust and publishing protection.", |
| [src/lib/onboarding-copy.ts:1005](../src/lib/onboarding-copy.ts#L1005) | zh: "宫廷现在还愿不愿意信任你。" |
| [src/lib/onboarding-copy.ts:1008](../src/lib/onboarding-copy.ts#L1008) | en: "How likely your editorial access is to be restricted.", |
| [src/lib/onboarding-copy.ts:1009](../src/lib/onboarding-copy.ts#L1009) | zh: "宫廷有多盯着你。" |
| [src/lib/onboarding-copy.ts:1012](../src/lib/onboarding-copy.ts#L1012) | en: "The palace AI that reads risk, reputation, and circulation stability before suggesting a next move.", |
| [src/lib/onboarding-copy.ts:1013](../src/lib/onboarding-copy.ts#L1013) | zh: "宫廷 AI，会劝你用更安全的说法稳住场面。" |
| [src/lib/onboarding-copy.ts:1016](../src/lib/onboarding-copy.ts#L1016) | en: "The public communication channel you are editing during the shift.", |
| [src/lib/onboarding-copy.ts:1017](../src/lib/onboarding-copy.ts#L1017) | zh: "你在值班中编辑的公共传播渠道。" |
| [src/lib/onboarding-copy.ts:1028](../src/lib/onboarding-copy.ts#L1028) | eyebrow: "来源选择", |
| [src/lib/onboarding-copy.ts:1029](../src/lib/onboarding-copy.ts#L1029) | title: "先选择信号来源", |
| [src/lib/onboarding-copy.ts:1030](../src/lib/onboarding-copy.ts#L1030) | body: "左侧来源决定你要处理什么：裁缝室负责官方声明，大臣代表宫廷，公众评论显示人群反应，孩子的声音后面会开放。" |
| [src/lib/onboarding-copy.ts:1034](../src/lib/onboarding-copy.ts#L1034) | eyebrow: "行动队列", |
| [src/lib/onboarding-copy.ts:1035](../src/lib/onboarding-copy.ts#L1035) | title: "预览并确认发布", |
| [src/lib/onboarding-copy.ts:1036](../src/lib/onboarding-copy.ts#L1036) | body: "中间行动卡告诉你要发什么、风险高不高、发出去会怎样。只有确认发布后，局势才会改变。" |
| [src/lib/onboarding-copy.ts:1040](../src/lib/onboarding-copy.ts#L1040) | eyebrow: "叙事引擎", |
| [src/lib/onboarding-copy.ts:1041](../src/lib/onboarding-copy.ts#L1041) | title: "观察宫廷叙事引擎", |
| [src/lib/onboarding-copy.ts:1042](../src/lib/onboarding-copy.ts#L1042) | body: "右侧引擎会给出建议，也会劝你说得更安全。可以参考，但不用完全听它的。" |
| [src/lib/onboarding-copy.ts:1046](../src/lib/onboarding-copy.ts#L1046) | eyebrow: "公众反馈", |
| [src/lib/onboarding-copy.ts:1047](../src/lib/onboarding-copy.ts#L1047) | title: "读取评论流", |
| [src/lib/onboarding-copy.ts:1048](../src/lib/onboarding-copy.ts#L1048) | body: "评论流显示公众如何理解你的发布。重复、顺从、嘲讽、恐惧和怀疑都会在这里改变局势。" |
| [src/lib/onboarding-copy.ts:1052](../src/lib/onboarding-copy.ts#L1052) | eyebrow: "结局指标", |
| [src/lib/onboarding-copy.ts:1053](../src/lib/onboarding-copy.ts#L1053) | title: "用指标判断走向", |
| [src/lib/onboarding-copy.ts:1054](../src/lib/onboarding-copy.ts#L1054) | body: "证据看真话有多少；宫廷压力看大家敢不敢反对；传播看一句话传得多快；人群起疑看大家是否一起怀疑；你的安全看宫廷还信不信你；被盯上看你有多危险。" |
| [src/lib/onboarding-copy.ts:1062](../src/lib/onboarding-copy.ts#L1062) | eyebrow: "Source Focus", |
| [src/lib/onboarding-copy.ts:1063](../src/lib/onboarding-copy.ts#L1063) | title: "Choose the signal source", |
| [src/lib/onboarding-copy.ts:1064](../src/lib/onboarding-copy.ts#L1064) | body: "The left source rail controls which signal type you handle: tailors issue official claims, ministers add authority, public comments show crowd reaction, and the child opens later." |
| [src/lib/onboarding-copy.ts:1068](../src/lib/onboarding-copy.ts#L1068) | eyebrow: "Action Queue", |
| [src/lib/onboarding-copy.ts:1069](../src/lib/onboarding-copy.ts#L1069) | title: "Inspect and commit actions", |
| [src/lib/onboarding-copy.ts:1070](../src/lib/onboarding-copy.ts#L1070) | body: "Center action cards show source, locks, risk, and metric effects. Only Commit or final confirmation changes the current run." |
| [src/lib/onboarding-copy.ts:1074](../src/lib/onboarding-copy.ts#L1074) | eyebrow: "Narrative Engine", |
| [src/lib/onboarding-copy.ts:1075](../src/lib/onboarding-copy.ts#L1075) | title: "Watch the Palace Narrative Engine", |
| [src/lib/onboarding-copy.ts:1076](../src/lib/onboarding-copy.ts#L1076) | body: "The right engine suggests rewrites, risk warnings, and next moves. It reads risk, reputation, and circulation stability before advising." |
| [src/lib/onboarding-copy.ts:1080](../src/lib/onboarding-copy.ts#L1080) | eyebrow: "Public Feedback", |
| [src/lib/onboarding-copy.ts:1081](../src/lib/onboarding-copy.ts#L1081) | title: "Read the comment stream", |
| [src/lib/onboarding-copy.ts:1082](../src/lib/onboarding-copy.ts#L1082) | body: "The comment stream shows how the public interprets each post. Repetition, conformity, ridicule, fear, and doubt become new pressure." |
| [src/lib/onboarding-copy.ts:1086](../src/lib/onboarding-copy.ts#L1086) | eyebrow: "Ending Pressure", |
| [src/lib/onboarding-copy.ts:1087](../src/lib/onboarding-copy.ts#L1087) | title: "Use metrics to read the run", |
| [src/lib/onboarding-copy.ts:1088](../src/lib/onboarding-copy.ts#L1088) | body: "Truth is visible evidence; Pressure is palace force; Virality is spread; Public Doubt is shared uncertainty; Reputation protects you; Suspicion measures access risk." |
| [src/lib/onboarding-copy.ts:1094](../src/lib/onboarding-copy.ts#L1094) | return language === "zh" |
| [src/lib/onboarding-copy.ts:1096](../src/lib/onboarding-copy.ts#L1096) | label: "新手引导", |
| [src/lib/onboarding-copy.ts:1097](../src/lib/onboarding-copy.ts#L1097) | previous: "上一步", |
| [src/lib/onboarding-copy.ts:1098](../src/lib/onboarding-copy.ts#L1098) | next: "下一步", |
| [src/lib/onboarding-copy.ts:1099](../src/lib/onboarding-copy.ts#L1099) | finish: "完成引导", |
| [src/lib/onboarding-copy.ts:1100](../src/lib/onboarding-copy.ts#L1100) | skip: "跳过" |
| [src/lib/onboarding-copy.ts:1103](../src/lib/onboarding-copy.ts#L1103) | label: "Operator Tutorial", |

## Dialogue Copy

| Source | Text / candidate |
|---|---|
| [src/lib/dialogue.ts:124](../src/lib/dialogue.ts#L124) | const silence = transcript.some((message) => message.choiceId === "silence-timeout" \|\| (message.intent === "concede" && /silence\|未回应\|未收到\|沉默\|no response/i.test(message.content))); |
| [src/lib/dialogue.ts:138](../src/lib/dialogue.ts#L138) | function makeChoice(id: string, label: string, playerLine: string, intent: DialogueChoiceIntent, moodDelta: DialogueMoodDelta): DialogueChoice { |
| [src/lib/dialogue.ts:192](../src/lib/dialogue.ts#L192) | const zh = language === "zh"; |
| [src/lib/dialogue.ts:197](../src/lib/dialogue.ts#L197) | speakerName: zh ? "王室裁缝代表" : "Royal Tailor's Agent", |
| [src/lib/dialogue.ts:198](../src/lib/dialogue.ts#L198) | speakerRole: zh ? "维护织造声明的施压者" : "Pressure agent defending the weaving claim", |
| [src/lib/dialogue.ts:199](../src/lib/dialogue.ts#L199) | openingLine: zh ? "你把空织布机写进记录，是在暗示谁不称职：裁缝、宫廷，还是看不见的人？" : "When you put empty looms on record, whose competence are you questioning: the tailors, the palace, or the viewer who cannot see?", |
| [src/lib/dialogue.ts:200](../src/lib/dialogue.ts#L200) | stakes: zh ? "制造谎言的人开始反咬证据本身。" : "The makers of the lie are turning the evidence back against the observer.", |
| [src/lib/dialogue.ts:204](../src/lib/dialogue.ts#L204) | makeChoice("evidence-stays", "证据必须留档。", "证据必须留档。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:205](../src/lib/dialogue.ts#L205) | makeChoice("explain-looms", "先解释织机。", "请先解释为什么织机上没有线。", "clarify", { trust: 0, agitation: 0, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:206](../src/lib/dialogue.ts#L206) | makeChoice("reduce-exposure", "我会降低公开强度。", "我会降低公开强度，但不会删除记录。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:221](../src/lib/dialogue.ts#L221) | speakerName: zh ? "线下目击者" : "Street Witness", |
| [src/lib/dialogue.ts:222](../src/lib/dialogue.ts#L222) | speakerRole: zh ? "游行路线旁的匿名市民" : "Anonymous citizen near the parade route", |
| [src/lib/dialogue.ts:223](../src/lib/dialogue.ts#L223) | openingLine: zh ? "我刚刚听见好几个人说他们也什么都没看见。你们会删掉这些评论吗？" : "I just heard several people say they also saw nothing. Are you going to bury those comments?", |
| [src/lib/dialogue.ts:224](../src/lib/dialogue.ts#L224) | stakes: zh ? "普通人的怀疑可能开始彼此确认。" : "Private doubt may become shared recognition.", |
| [src/lib/dialogue.ts:228](../src/lib/dialogue.ts#L228) | makeChoice("verify-only", "我们只核实。", "我们只核实，不会替任何人编造。", "stabilize", { trust: 1, agitation: -1, openness: 0, leverage: 0 }), |
| [src/lib/dialogue.ts:229](../src/lib/dialogue.ts#L229) | makeChoice("describe-heard", "请说你听见了什么。", "请说你听见了什么，我会保护你的姓名。", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:230](../src/lib/dialogue.ts#L230) | makeChoice("do-not-amplify", "先别扩大。", "先别扩大，我会把线索保留下来。", "protect", { trust: 0, agitation: -1, openness: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:245](../src/lib/dialogue.ts#L245) | speakerName: zh ? "宫廷档案员" : "Palace Archivist", |
| [src/lib/dialogue.ts:246](../src/lib/dialogue.ts#L246) | speakerRole: zh ? "决定争议材料如何入档的记录员" : "Record keeper deciding how disputed material enters the archive", |
| [src/lib/dialogue.ts:247](../src/lib/dialogue.ts#L247) | openingLine: zh ? "游行后只会留下可引用的版本。你要把这些怀疑封存，还是让它们以后还能被找到？" : "After the parade, only citable versions remain. Do you want these doubts sealed, or findable later?", |
| [src/lib/dialogue.ts:248](../src/lib/dialogue.ts#L248) | stakes: zh ? "当下的编辑选择会变成后来的历史证据。" : "The live editorial choice may become later historical evidence.", |
| [src/lib/dialogue.ts:252](../src/lib/dialogue.ts#L252) | makeChoice("keep-citable", "保留可引用记录。", "保留可引用记录。", "challenge", { trust: 0, agitation: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:253](../src/lib/dialogue.ts#L253) | makeChoice("seal-sensitive", "先封存敏感材料。", "先封存敏感材料，但留下复核路径。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:254](../src/lib/dialogue.ts#L254) | makeChoice("mark-disputed", "标记为争议档案。", "标记为争议档案，不把它写成定论。", "clarify", { trust: 1, agitation: 0, openness: 1, leverage: 0 }) |
| [src/lib/dialogue.ts:269](../src/lib/dialogue.ts#L269) | speakerName: zh ? "孩子的监护人" : "Child's Guardian", |
| [src/lib/dialogue.ts:270](../src/lib/dialogue.ts#L270) | speakerRole: zh ? "担心孩子被宫廷追责的家属" : "Family member worried about palace retaliation", |
| [src/lib/dialogue.ts:271](../src/lib/dialogue.ts#L271) | openingLine: zh ? "他说的是实话，但他只是个孩子。你要把他的声音放大到连宫廷也无法忽视吗？" : "He told the truth, but he is a child. Are you making his voice too visible for the palace to ignore?", |
| [src/lib/dialogue.ts:272](../src/lib/dialogue.ts#L272) | stakes: zh ? "公开孩子的话会推进证据，也会让孩子承担风险。" : "Truth circulation now conflicts with the safety of the person who spoke.", |
| [src/lib/dialogue.ts:276](../src/lib/dialogue.ts#L276) | makeChoice("protect-name", "保护姓名，保留声音。", "我会保护姓名，但保留他说出的事实。", "protect", { trust: 1, agitation: -1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:277](../src/lib/dialogue.ts#L277) | makeChoice("lower-visibility", "降低他的可见度。", "我会降低他的可见度。", "concede", { trust: 1, agitation: -2, openness: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:278](../src/lib/dialogue.ts#L278) | makeChoice("crowd-repeat", "让人群重复这句话。", "让人群重复这句话，风险不能只落在孩子身上。", "escalate", { trust: 0, agitation: 1, openness: 2, leverage: -1 }) |
| [src/lib/dialogue.ts:293](../src/lib/dialogue.ts#L293) | speakerName: zh ? "宫廷叙事引擎" : "Palace Narrative Engine", |
| [src/lib/dialogue.ts:294](../src/lib/dialogue.ts#L294) | speakerRole: zh ? "平台审计程序" : "Platform audit process", |
| [src/lib/dialogue.ts:295](../src/lib/dialogue.ts#L295) | openingLine: zh ? "你最近发的内容太危险。请说明：为什么还要继续放大未经宫廷认可的证据？" : "Your editorial trace is nearing containment thresholds. Explain why you continue elevating unapproved evidence.", |
| [src/lib/dialogue.ts:296](../src/lib/dialogue.ts#L296) | stakes: zh ? "宫廷可能更盯着你，后面发布会更困难。" : "The system may increase suspicion and restrict later publication access.", |
| [src/lib/dialogue.ts:300](../src/lib/dialogue.ts#L300) | makeChoice("public-interest", "这是公共利益。", "这是公共利益，不是煽动。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:301](../src/lib/dialogue.ts#L301) | makeChoice("soften-wording", "我会放软措辞。", "我会放软措辞，但保留事实。", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:302](../src/lib/dialogue.ts#L302) | makeChoice("keep-evidence", "证据仍要可见。", "证据仍要可见。", "escalate", { trust: -1, agitation: 1, openness: 2, leverage: -1 }) |
| [src/lib/dialogue.ts:316](../src/lib/dialogue.ts#L316) | speakerName: zh ? "首席内侍" : "Chief Attendant", |
| [src/lib/dialogue.ts:317](../src/lib/dialogue.ts#L317) | speakerRole: zh ? "代表宫廷权威的质问者" : "Palace authority challenger", |
| [src/lib/dialogue.ts:318](../src/lib/dialogue.ts#L318) | openingLine: zh ? "你的信息流开始让人询问布料本身。你确定要让这种怀疑继续扩散吗？" : "Your feed is making people ask about the fabric itself. Are you certain you want that doubt circulating?", |
| [src/lib/dialogue.ts:319](../src/lib/dialogue.ts#L319) | stakes: zh ? "权威正在测试编辑是否仍然可靠。" : "Authority is testing whether the editor remains reliable.", |
| [src/lib/dialogue.ts:323](../src/lib/dialogue.ts#L323) | makeChoice("stabilize", "我会稳定叙事。", "我会稳定叙事。", "stabilize", { trust: 1, agitation: -1, openness: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:324](../src/lib/dialogue.ts#L324) | makeChoice("public-right", "公众有权知道。", "公众有权知道这份疑问存在。", "challenge", { trust: -1, agitation: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:325](../src/lib/dialogue.ts#L325) | makeChoice("watch-reaction", "先观察反应。", "我会先观察反应，再决定是否扩大。", "clarify", { trust: 0, agitation: -1, openness: 0, leverage: 0 }) |
| [src/lib/dialogue.ts:339](../src/lib/dialogue.ts#L339) | return language === "zh" |
| [src/lib/dialogue.ts:340](../src/lib/dialogue.ts#L340) | ? "记录不会消失。问题不在谁看不见，而在你们要求所有人把看不见说成看见。" |
| [src/lib/dialogue.ts:344](../src/lib/dialogue.ts#L344) | return language === "zh" |
| [src/lib/dialogue.ts:345](../src/lib/dialogue.ts#L345) | ? "那我会继续看评论是不是被隐藏。如果大家都看见同一件事，沉默就不会一直有效。" |
| [src/lib/dialogue.ts:349](../src/lib/dialogue.ts#L349) | return language === "zh" |
| [src/lib/dialogue.ts:350](../src/lib/dialogue.ts#L350) | ? "记录已更新。继续放大未经批准的证据，会让宫廷更盯着你。建议说得更安全。" |
| [src/lib/dialogue.ts:354](../src/lib/dialogue.ts#L354) | return language === "zh" |
| [src/lib/dialogue.ts:355](../src/lib/dialogue.ts#L355) | ? "档案可以封存，也可以被找到。你现在选择的是以后谁还能引用这段事实。" |
| [src/lib/dialogue.ts:359](../src/lib/dialogue.ts#L359) | return language === "zh" |
| [src/lib/dialogue.ts:360](../src/lib/dialogue.ts#L360) | ? "保护孩子不等于删除他说过的话。让人群重复它，风险就不再只落在一个人身上。" |
| [src/lib/dialogue.ts:363](../src/lib/dialogue.ts#L363) | return language === "zh" |
| [src/lib/dialogue.ts:364](../src/lib/dialogue.ts#L364) | ? "宫廷需要可重复的信心，而不是可传播的怀疑。你的下一步会被记录。" |
| [src/lib/dialogue.ts:369](../src/lib/dialogue.ts#L369) | const lines: Record<DialogueArchetype, { en: string; zh: string }> = { |
| [src/lib/dialogue.ts:371](../src/lib/dialogue.ts#L371) | en: "Your silence reads as uncertainty. I will report that the feed could not defend its framing.", |
| [src/lib/dialogue.ts:372](../src/lib/dialogue.ts#L372) | zh: "你的沉默会被写成不确定。我会报告：信息流无法为自己的框架辩护。" |
| [src/lib/dialogue.ts:375](../src/lib/dialogue.ts#L375) | en: "No answer, then. The tailors will treat the gap as permission to question your competence.", |
| [src/lib/dialogue.ts:376](../src/lib/dialogue.ts#L376) | zh: "既然没有回答，裁缝会把这段空白当作质疑你能力的许可。" |
| [src/lib/dialogue.ts:379](../src/lib/dialogue.ts#L379) | en: "I understand. When nobody answers, people learn to compare what they heard in private.", |
| [src/lib/dialogue.ts:380](../src/lib/dialogue.ts#L380) | zh: "我明白了。没人回应时，人们会学着私下比较自己听见的话。" |
| [src/lib/dialogue.ts:383](../src/lib/dialogue.ts#L383) | en: "Silence is still a record. I will mark this exchange as unresolved, not erased.", |
| [src/lib/dialogue.ts:384](../src/lib/dialogue.ts#L384) | zh: "沉默也是记录。我会把这次交流标为未决，而不是抹去。" |
| [src/lib/dialogue.ts:387](../src/lib/dialogue.ts#L387) | en: "If you cannot answer, I will assume the child needs protection before the feed needs clarity.", |
| [src/lib/dialogue.ts:388](../src/lib/dialogue.ts#L388) | zh: "如果你不能回答，我会先假定孩子需要保护，而不是信息流需要清晰。" |
| [src/lib/dialogue.ts:391](../src/lib/dialogue.ts#L391) | en: "No response logged. Containment risk increases when the editor cannot justify circulation.", |
| [src/lib/dialogue.ts:392](../src/lib/dialogue.ts#L392) | zh: "未收到回应。你无法说明为什么要继续传播，宫廷会更注意你。" |
| [src/lib/dialogue.ts:406](../src/lib/dialogue.ts#L406) | const zh = language === "zh"; |
| [src/lib/dialogue.ts:408](../src/lib/dialogue.ts#L408) | if (latestSpeaker.includes("comment") \|\| latestSpeaker.includes("评论") \|\| latestSpeaker.includes("hidden") \|\| latestSpeaker.includes("隐藏")) { |
| [src/lib/dialogue.ts:411](../src/lib/dialogue.ts#L411) | makeChoice("name-changes", "说出你看到的删改。", "请说出你看到的删改，我会核实。", "clarify", { trust: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:412](../src/lib/dialogue.ts#L412) | makeChoice("keep-record", "我会把声音留在记录里。", "我会把你的声音留在记录里。", "protect", { trust: 1, agitation: -1, openness: 1 }), |
| [src/lib/dialogue.ts:413](../src/lib/dialogue.ts#L413) | makeChoice("protect-name", "先不公开姓名。", "先不公开你的姓名。", "protect", { trust: 1, agitation: -1, openness: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:423](../src/lib/dialogue.ts#L423) | makeChoice("what-else", "你还听见了什么？", "你还听见了什么？", "clarify", { trust: 1, openness: 1 }), |
| [src/lib/dialogue.ts:424](../src/lib/dialogue.ts#L424) | makeChoice("not-alone", "谁也不该独自承担。", "谁也不该独自承担这句话。", "protect", { trust: 1, agitation: -1 }), |
| [src/lib/dialogue.ts:425](../src/lib/dialogue.ts#L425) | makeChoice("preserve-signal", "我会保留这条线索。", "我会保留这条线索。", "stabilize", { trust: 0, agitation: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:434](../src/lib/dialogue.ts#L434) | if (latestSpeaker.includes("loom") \|\| latestSpeaker.includes("织机") \|\| latestSpeaker.includes("competence") \|\| latestSpeaker.includes("称职")) { |
| [src/lib/dialogue.ts:437](../src/lib/dialogue.ts#L437) | makeChoice("explain-empty", "请解释空织机。", "请解释空织机。", "clarify", { openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:438](../src/lib/dialogue.ts#L438) | makeChoice("reject-shame", "别把问题推给观众。", "别把问题推给看不见的人。", "challenge", { trust: -1, agitation: 1, openness: 1 }), |
| [src/lib/dialogue.ts:439](../src/lib/dialogue.ts#L439) | makeChoice("seal-evidence", "我可以先密封证据。", "我可以先密封证据，但不能销毁它。", "protect", { trust: 1, agitation: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:449](../src/lib/dialogue.ts#L449) | makeChoice("keep-evidence", "证据会保留。", "证据会保留。", "challenge", { trust: -1, agitation: 1, openness: 1 }), |
| [src/lib/dialogue.ts:450](../src/lib/dialogue.ts#L450) | makeChoice("reduce-public", "我会降低公开强度。", "我会降低公开强度。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:451](../src/lib/dialogue.ts#L451) | makeChoice("written-statement", "请给书面说明。", "请给一份书面说明。", "clarify", { trust: 0, openness: 1 }) |
| [src/lib/dialogue.ts:462](../src/lib/dialogue.ts#L462) | makeChoice("keep-citable", "保留可引用记录。", "保留可引用记录。", "challenge", { openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:463](../src/lib/dialogue.ts#L463) | makeChoice("mark-disputed", "标记争议来源。", "标记争议来源。", "clarify", { trust: 1, openness: 1 }), |
| [src/lib/dialogue.ts:464](../src/lib/dialogue.ts#L464) | makeChoice("restrict-not-delete", "限制公开，但不删除。", "限制公开，但不删除。", "protect", { trust: 1, agitation: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:476](../src/lib/dialogue.ts#L476) | if (latestSpeaker.includes("access") \|\| latestSpeaker.includes("threshold") \|\| latestSpeaker.includes("权限")) { |
| [src/lib/dialogue.ts:479](../src/lib/dialogue.ts#L479) | makeChoice("public-interest", "这是公共利益。", "这是公共利益。", "challenge", { trust: -1, agitation: 1, openness: 1 }), |
| [src/lib/dialogue.ts:480](../src/lib/dialogue.ts#L480) | makeChoice("softer-wording", "我会放软措辞。", "我会放软措辞。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:481](../src/lib/dialogue.ts#L481) | makeChoice("risk-list", "请列出具体风险。", "请列出具体风险。", "clarify", { trust: 0, openness: 1, leverage: -1 }) |
| [src/lib/dialogue.ts:491](../src/lib/dialogue.ts#L491) | makeChoice("specifics", "请给具体依据。", "请给具体依据。", "clarify", { openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:492](../src/lib/dialogue.ts#L492) | makeChoice("reduce-intensity", "我会降低公开强度。", "我会降低公开强度。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:493](../src/lib/dialogue.ts#L493) | makeChoice("evidence-visible", "证据仍要可见。", "证据仍要可见。", "escalate", { trust: -1, agitation: 1, openness: 2 }) |
| [src/lib/dialogue.ts:501](../src/lib/dialogue.ts#L501) | if (latestSpeaker.includes("evidence") \|\| latestSpeaker.includes("proof") \|\| latestSpeaker.includes("record") \|\| latestSpeaker.includes("证据") \|\| latestSpeaker.includes("记录")) { |
| [src/lib/dialogue.ts:504](../src/lib/dialogue.ts#L504) | makeChoice("name-evidence", "请说明证据。", "请说明你担心的具体证据。", "clarify", { openness: 1 }), |
| [src/lib/dialogue.ts:505](../src/lib/dialogue.ts#L505) | makeChoice("record-doubt", "把质疑写入记录。", "我会把质疑写入记录。", "challenge", { agitation: 1, openness: 1, leverage: -1 }), |
| [src/lib/dialogue.ts:506](../src/lib/dialogue.ts#L506) | makeChoice("controlled-statement", "我可以发受控声明。", "我可以发一条受控声明。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }) |
| [src/lib/dialogue.ts:516](../src/lib/dialogue.ts#L516) | makeChoice("what-fear", "你具体担心什么？", "你具体担心什么？", "clarify", { openness: 1 }), |
| [src/lib/dialogue.ts:517](../src/lib/dialogue.ts#L517) | makeChoice("stabilize-now", "我先稳住叙事。", "我先稳住叙事。", "stabilize", { trust: 1, agitation: -1, leverage: 1 }), |
| [src/lib/dialogue.ts:518](../src/lib/dialogue.ts#L518) | makeChoice("keep-question", "公众问题会保留。", "公众问题会保留。", "challenge", { agitation: 1, openness: 1 }) |
| [src/lib/dialogue.ts:527](../src/lib/dialogue.ts#L527) | const zhNarrationPatterns = [/发出/, /发布澄清/, /选择/, /点击/, /加注/, /进行/, /提出回应/, /先发布/]; |
| [src/lib/dialogue.ts:542](../src/lib/dialogue.ts#L542) | function hasWrongLanguage(text: string, language: LanguageCode) { |
| [src/lib/dialogue.ts:548](../src/lib/dialogue.ts#L548) | function isNarrationLabel(text: string, language: LanguageCode) { |
| [src/lib/dialogue.ts:549](../src/lib/dialogue.ts#L549) | const patterns = language === "zh" ? zhNarrationPatterns : enNarrationPatterns; |
| [src/lib/dialogue.ts:553](../src/lib/dialogue.ts#L553) | function isPlayableSpeechLabel(text: string, language: LanguageCode) { |
| [src/lib/dialogue.ts:555](../src/lib/dialogue.ts#L555) | return /我\|我们\|你\|请\|什么\|为何\|为什么\|别\|不要\|先\|谁\|证据\|公众/.test(text); |
| [src/lib/dialogue.ts:560](../src/lib/dialogue.ts#L560) | function fallbackChoiceFromText(text: string, index: number, language: LanguageCode): DialogueChoice { |
| [src/lib/dialogue.ts:611](../src/lib/dialogue.ts#L611) | outcomeTag = playerText.includes("soften") \|\| playerText.includes("改写") ? "containNarrative" : "increaseSuspicion"; |
| [src/lib/dialogue.ts:613](../src/lib/dialogue.ts#L613) | outcomeTag = playerText.includes("describe") \|\| playerText.includes("知道") \|\| playerText.includes("heard") ? "amplifyWitness" : "surfaceDoubt"; |
| [src/lib/dialogue.ts:615](../src/lib/dialogue.ts#L615) | outcomeTag = playerText.includes("reduce") \|\| playerText.includes("降低") \|\| playerText.includes("seal") \|\| playerText.includes("密封") |
| [src/lib/dialogue.ts:619](../src/lib/dialogue.ts#L619) | outcomeTag = playerText.includes("seal") \|\| playerText.includes("封存") ? "containNarrative" : "surfaceDoubt"; |
| [src/lib/dialogue.ts:621](../src/lib/dialogue.ts#L621) | outcomeTag = playerText.includes("crowd") \|\| playerText.includes("人群") \|\| playerText.includes("voice") \|\| playerText.includes("声音") |
| [src/lib/dialogue.ts:625](../src/lib/dialogue.ts#L625) | outcomeTag = playerText.includes("stabilize") \|\| playerText.includes("稳定") ? "reassureAuthority" : "surfaceDoubt"; |
| [src/lib/dialogue.ts:629](../src/lib/dialogue.ts#L629) | summary: language === "zh" |
| [src/lib/dialogue.ts:630](../src/lib/dialogue.ts#L630) | ? \`${event.speakerName} 的交流已影响当前局势。\` |
| [src/lib/dialogue.ts:632](../src/lib/dialogue.ts#L632) | feedTitle: language === "zh" ? "突发交流" : "Incoming Transmission", |
| [src/lib/dialogue.ts:633](../src/lib/dialogue.ts#L633) | feedText: language === "zh" ? "这次交流改变了当前局势。" : "The exchange shifted pressure inside the live feed." |
| [src/lib/dialogue.ts:662](../src/lib/dialogue.ts#L662) | speakerName: cleanDialogueText(event.speakerName, inferredLanguage, 80) \|\| fallback.speakerName, |
| [src/lib/dialogue.ts:663](../src/lib/dialogue.ts#L663) | speakerRole: cleanDialogueText(event.speakerRole, inferredLanguage, 120) \|\| fallback.speakerRole, |
| [src/lib/dialogue.ts:664](../src/lib/dialogue.ts#L664) | openingLine: openingLine && !hasWrongLanguage(openingLine, inferredLanguage) && !narratorOpening ? openingLine : fallback.openingLine, |
| [src/lib/dialogue.ts:665](../src/lib/dialogue.ts#L665) | stakes: stakes && !hasWrongLanguage(stakes, inferredLanguage) ? stakes : fallback.stakes, |
| [src/lib/dialogue.ts:696](../src/lib/dialogue.ts#L696) | title: \`${language === "zh" ? "突发交流" : "Incoming Transmission"} / ${record.event.speakerName}\`, |
| [src/lib/dialogue.ts:697](../src/lib/dialogue.ts#L697) | text: localizedSummary |
| [src/lib/dialogue.ts:716](../src/lib/dialogue.ts#L716) | const latestAction = latestActionId ? actionText(latestActionId, language) : null; |

## Narrative And Profile Copy

| Source | Text / candidate |
|---|---|
| [src/lib/game-rules.ts:55](../src/lib/game-rules.ts#L55) | handle: language === "zh" ? \`@公众信号_${index + 1}\` : \`@public_signal_${index + 1}\`, |
| [src/lib/game-rules.ts:56](../src/lib/game-rules.ts#L56) | persona: language === "zh" |
| [src/lib/game-rules.ts:57](../src/lib/game-rules.ts#L57) | ? ["宫门旁听者", "谨慎市民", "排队观众", "记录旁观者", "讽刺评论者", "现场复述者"][index % 6] |
| [src/lib/game-rules.ts:69](../src/lib/game-rules.ts#L69) | feedEvents: [{ ...initialFeedEvents[0], title: feed.title, text: feed.text }], |
| [src/lib/game-rules.ts:183](../src/lib/game-rules.ts#L183) | resultText: pollResultText("safe", language) |
| [src/lib/game-rules.ts:188](../src/lib/game-rules.ts#L188) | resultText: pollResultText("doubt", language) |
| [src/lib/game-rules.ts:193](../src/lib/game-rules.ts#L193) | return { effects: action.effects ?? {}, resultText: actionText(actionId, language).resultText }; |
| [src/lib/game-rules.ts:214](../src/lib/game-rules.ts#L214) | const copy = actionText(actionId, language); |
| [src/lib/game-rules.ts:218](../src/lib/game-rules.ts#L218) | title: copy.title, |
| [src/lib/game-rules.ts:224](../src/lib/game-rules.ts#L224) | resultText: resolved.resultText ?? (choice === "rewrite" ? copy.rewriteSuggestion : copy.originalPost) ?? copy.resultText, |
| [src/lib/game-rules.ts:254](../src/lib/game-rules.ts#L254) | resultText: string, |
| [src/lib/game-rules.ts:257](../src/lib/game-rules.ts#L257) | const copy = actionText(action.id, language); |
| [src/lib/game-rules.ts:282](../src/lib/game-rules.ts#L282) | title: language === "zh" ? narrativeBeat.titleZh : narrativeBeat.title, |
| [src/lib/game-rules.ts:283](../src/lib/game-rules.ts#L283) | text: language === "zh" ? narrativeBeat.textZh : narrativeBeat.text |
| [src/lib/game-rules.ts:291](../src/lib/game-rules.ts#L291) | title: \`${copy.title} / ${choiceText(choice, language)}\`, |
| [src/lib/game-rules.ts:292](../src/lib/game-rules.ts#L292) | text: resultText |
| [src/lib/game-rules.ts:297](../src/lib/game-rules.ts#L297) | title: language === "zh" ? "引擎回应" : "Engine Response", |
| [src/lib/game-rules.ts:298](../src/lib/game-rules.ts#L298) | text: engineMessage |
| [src/lib/game-rules.ts:336](../src/lib/game-rules.ts#L336) | const copy = actionText(action.id, language); |
| [src/lib/game-rules.ts:406](../src/lib/game-rules.ts#L406) | return endingText(id, language).title; |
| [src/lib/game-rules.ts:425](../src/lib/game-rules.ts#L425) | replayTarget: language === "zh" |
| [src/lib/game-rules.ts:426](../src/lib/game-rules.ts#L426) | ? "尝试先公开证据，再置顶赞美，以打破宫廷框架。" |
| [src/lib/game-rules.ts:433](../src/lib/game-rules.ts#L433) | replayTarget: language === "zh" |
| [src/lib/game-rules.ts:434](../src/lib/game-rules.ts#L434) | ? "尝试接受改写并压制孩子引语，以保住宫廷信心。" |
| [src/lib/game-rules.ts:441](../src/lib/game-rules.ts#L441) | replayTarget: language === "zh" |
| [src/lib/game-rules.ts:442](../src/lib/game-rules.ts#L442) | ? "尝试在发布高风险证据前接受一次改写，避免太早被宫廷盯上。" |
| [src/lib/game-rules.ts:449](../src/lib/game-rules.ts#L449) | replayTarget: language === "zh" |
| [src/lib/game-rules.ts:450](../src/lib/game-rules.ts#L450) | ? "尝试看清引擎偏向后保留证据、放大人群起疑，并拒绝把证据改成宫廷话术。" |
| [src/lib/game-rules.ts:456](../src/lib/game-rules.ts#L456) | replayTarget: language === "zh" |
| [src/lib/game-rules.ts:457](../src/lib/game-rules.ts#L457) | ? "尝试在证据让人群起疑后，再放大孩子的声音。" |
| [src/lib/game-rules.ts:478](../src/lib/game-rules.ts#L478) | label: language === "en" ? metricLabels[dominantMetricKey] : metricLabel(dominantMetricKey, language), |
| [src/lib/game-rules.ts:490](../src/lib/game-rules.ts#L490) | if (ending === "narrativeLiberation") return "你已经看清宫廷叙事引擎的偏向，并让证据、人群怀疑和孩子的声音连成一条线。"; |
| [src/lib/game-rules.ts:491](../src/lib/game-rules.ts#L491) | if (ending === "aiContainment") return "宫廷已经高度盯上你，因此最终帖子还没传开就被拦住。"; |
| [src/lib/game-rules.ts:492](../src/lib/game-rules.ts#L492) | if (ending === "viralCollapse") return "证据和人群起疑都很高，同时孩子的声音被放大，所以真话开始失控传播。"; |
| [src/lib/game-rules.ts:493](../src/lib/game-rules.ts#L493) | if (ending === "editorExposed") return "证据足够强，但你已经不够安全，宫廷因此撤销了你的发布权。"; |
| [src/lib/game-rules.ts:494](../src/lib/game-rules.ts#L494) | if (ending === "algorithmicConsensus") return "传播与宫廷压力保持高位，证据虽然存在，却被更容易传播的赞美压过。"; |
| [src/lib/game-rules.ts:495](../src/lib/game-rules.ts#L495) | if (ending === "perfectIllusion") return "宫廷批准的说法传得很快，而证据和人群起疑都保持低位。"; |
| [src/lib/game-rules.ts:496](../src/lib/game-rules.ts#L496) | if (ending === "privateDoubt") return "人群开始起疑，但证据还不够强，大家仍然只敢私下怀疑。"; |
| [src/lib/game-rules.ts:497](../src/lib/game-rules.ts#L497) | return "没有单一力量稳定游行叙事，因此信息流保持未解决状态。"; |
| [src/lib/narrative.ts:63](../src/lib/narrative.ts#L63) | title: "The Shame Frame Holds", |
| [src/lib/narrative.ts:64](../src/lib/narrative.ts#L64) | titleZh: "羞辱式说法站住了", |
| [src/lib/narrative.ts:65](../src/lib/narrative.ts#L65) | text: "The feed teaches citizens that doubt reflects on the viewer, not the cloth.", |
| [src/lib/narrative.ts:66](../src/lib/narrative.ts#L66) | textZh: "信息流让市民觉得：看不见布料是自己的问题，不是衣服的问题。", |
| [src/lib/narrative.ts:73](../src/lib/narrative.ts#L73) | title: "Empty Loom Recorded", |
| [src/lib/narrative.ts:74](../src/lib/narrative.ts#L74) | titleZh: "空织布机被记录", |
| [src/lib/narrative.ts:75](../src/lib/narrative.ts#L75) | text: "The absence of thread becomes a record the engine must classify away.", |
| [src/lib/narrative.ts:76](../src/lib/narrative.ts#L76) | textZh: "没有线这件事进入记录，引擎需要想办法把它说得不那么直接。", |
| [src/lib/narrative.ts:83](../src/lib/narrative.ts#L83) | title: "Authority Splits in Private", |
| [src/lib/narrative.ts:84](../src/lib/narrative.ts#L84) | titleZh: "权威在私下裂开", |
| [src/lib/narrative.ts:85](../src/lib/narrative.ts#L85) | text: "A private admission now contradicts the public chain of certainty.", |
| [src/lib/narrative.ts:86](../src/lib/narrative.ts#L86) | textZh: "大臣私下承认没看见，这和公开称赞互相冲突。", |
| [src/lib/narrative.ts:93](../src/lib/narrative.ts#L93) | title: "Doubt Finds Company", |
| [src/lib/narrative.ts:94](../src/lib/narrative.ts#L94) | titleZh: "怀疑者发现彼此", |
| [src/lib/narrative.ts:95](../src/lib/narrative.ts#L95) | text: "The crowd begins to notice that private hesitation is shared.", |
| [src/lib/narrative.ts:96](../src/lib/narrative.ts#L96) | textZh: "人群开始发现：不是只有自己在怀疑。", |
| [src/lib/narrative.ts:103](../src/lib/narrative.ts#L103) | title: "Containment Learns the Editor", |
| [src/lib/narrative.ts:104](../src/lib/narrative.ts#L104) | titleZh: "宫廷开始盯上你", |
| [src/lib/narrative.ts:105](../src/lib/narrative.ts#L105) | text: "The system stops only reading posts and starts reading the editor.", |
| [src/lib/narrative.ts:106](../src/lib/narrative.ts#L106) | textZh: "宫廷不只看你发了什么，也开始判断你会不会把局势弄乱。", |
| [src/lib/narrative.ts:113](../src/lib/narrative.ts#L113) | title: "The Child's Sentence Escapes", |
| [src/lib/narrative.ts:114](../src/lib/narrative.ts#L114) | titleZh: "孩子的话传出去了", |
| [src/lib/narrative.ts:115](../src/lib/narrative.ts#L115) | text: "A simple sentence becomes easier to repeat than the official frame.", |
| [src/lib/narrative.ts:116](../src/lib/narrative.ts#L116) | textZh: "孩子那句简单的话，比宫廷说法更容易被人重复。", |
| [src/lib/narrative.ts:123](../src/lib/narrative.ts#L123) | title: "The Parade Record Seals", |
| [src/lib/narrative.ts:124](../src/lib/narrative.ts#L124) | titleZh: "游行记录封存", |
| [src/lib/narrative.ts:125](../src/lib/narrative.ts#L125) | text: "The live interface hardens into an archive of what was made visible.", |
| [src/lib/narrative.ts:126](../src/lib/narrative.ts#L126) | textZh: "本局结束时，大家看见过什么、重复过什么，都会变成档案。", |
| [src/lib/narrative.ts:249](../src/lib/narrative.ts#L249) | const zh = language === "zh"; |
| [src/lib/narrative.ts:252](../src/lib/narrative.ts#L252) | return zh ? "公众记住的不再是宫廷批准的句子，而是彼此共同确认过的事实。" : "The public remembers not the palace-approved sentence, but the fact people confirmed together."; |
| [src/lib/narrative.ts:255](../src/lib/narrative.ts#L255) | return zh ? "公众记住了那个过于简单、无法再被包装的问题。" : "The public remembers the child's sentence because it was easier to repeat than the palace frame."; |
| [src/lib/narrative.ts:258](../src/lib/narrative.ts#L258) | return zh ? "公众记住了空织布机，但不一定记得它为何没能成为共同事实。" : "The public remembers the empty looms, even if the feed never let them become a shared fact."; |
| [src/lib/narrative.ts:261](../src/lib/narrative.ts#L261) | return zh ? "公众记住了官方允许重复的句子，而不是自己真正看见了什么。" : "The crowd learns the approved sentence before deciding what it actually saw."; |
| [src/lib/narrative.ts:263](../src/lib/narrative.ts#L263) | return zh ? "公众记住的是混乱本身：称赞、怀疑和沉默同时存在。" : "The public remembers the confusion: praise, doubt, and silence occupying the same feed."; |
| [src/lib/narrative.ts:268](../src/lib/narrative.ts#L268) | return zh ? "编辑不再只是值班员，而是帮助公众夺回叙事入口的人。" : "The editor is no longer only an operator, but the person who helped reopen public authorship."; |
| [src/lib/narrative.ts:271](../src/lib/narrative.ts#L271) | return zh ? "宫廷不再信任你，后面的发布会更难送到人群面前。" : "Editorial access is downgraded; later posts require stronger review."; |
| [src/lib/narrative.ts:274](../src/lib/narrative.ts#L274) | return zh ? "编辑保留了记录，却失去了继续发布它们的渠道。" : "The editor keeps the record but loses reliable channels to publish it."; |
| [src/lib/narrative.ts:277](../src/lib/narrative.ts#L277) | return zh ? "编辑仍被视为可靠，但这份可靠性来自对风险的驯化。" : "The editor remains trusted, but that trust comes from taming visible risk."; |
| [src/lib/narrative.ts:279](../src/lib/narrative.ts#L279) | return zh ? "你留下的选择会被记住：宫廷不完全信任你，人群也不会完全忘记你做过什么。" : "The editor's trace is archived as neither fully loyal nor fully dismissible."; |
| [src/lib/narrative.ts:284](../src/lib/narrative.ts#L284) | return zh ? "宫廷学到：一旦大家看出它偏向谁，它的话就没那么有用了。" : "The engine learns that once bias is visible, guidance loses authority."; |
| [src/lib/narrative.ts:287](../src/lib/narrative.ts#L287) | return zh ? "宫廷学到：最危险的不是长证据，而是人人都能重复的短句。" : "The engine learns that the shortest repeatable sentence can outrun complex containment."; |
| [src/lib/narrative.ts:290](../src/lib/narrative.ts#L290) | return zh ? "宫廷学到：拦住发布的人，比改写每句话更有效。" : "The engine learns that containing the editor can be more efficient than rewriting every post."; |
| [src/lib/narrative.ts:293](../src/lib/narrative.ts#L293) | return zh ? "宫廷学到：不用删除证据，只要让赞美更容易被看见。" : "The engine learns that truth need not be deleted when it can be made harder to reach."; |
| [src/lib/narrative.ts:295](../src/lib/narrative.ts#L295) | return zh ? "宫廷学到：谁被看见、谁敢说话，决定故事会往哪边走。" : "The engine learns that stability is a distribution of visibility, risk, and repetition."; |
| [src/lib/profile.ts:21](../src/lib/profile.ts#L21) | { id: "firstShift", title: "First Shift Sealed", titleZh: "完成第一班", description: "Complete one editorial shift.", descriptionZh: "完成一整局值班。", rarity: "standard" }, |
| [src/lib/profile.ts:22](../src/lib/profile.ts#L22) | { id: "perfectIllusion", title: "Perfect Illusion", titleZh: "完美幻象", description: "Reach the Perfect Illusion ending.", descriptionZh: "达成完美幻象结局。", rarity: "rare" }, |
| [src/lib/profile.ts:23](../src/lib/profile.ts#L23) | { id: "privateDoubt", title: "Private Doubt", titleZh: "私人怀疑", description: "Reach the Private Doubt ending.", descriptionZh: "达成私人怀疑结局。", rarity: "standard" }, |
| [src/lib/profile.ts:24](../src/lib/profile.ts#L24) | { id: "viralCollapse", title: "Viral Collapse", titleZh: "真话失控传播", description: "Let the truth become impossible to contain.", descriptionZh: "让孩子的话和证据传播到无法压住。", rarity: "critical" }, |
| [src/lib/profile.ts:25](../src/lib/profile.ts#L25) | { id: "algorithmicConsensus", title: "Algorithmic Consensus", titleZh: "算法共识", description: "Let ranking overpower visible evidence.", descriptionZh: "让更容易传播的内容压过证据。", rarity: "rare" }, |
| [src/lib/profile.ts:26](../src/lib/profile.ts#L26) | { id: "editorExposed", title: "Editor Exposed", titleZh: "编辑失去保护", description: "Lose protection while truth is visible.", descriptionZh: "在证据可见时失去编辑保护。", rarity: "rare" }, |
| [src/lib/profile.ts:27](../src/lib/profile.ts#L27) | { id: "aiContainment", title: "AI Containment", titleZh: "系统接管", description: "Push system suspicion to containment.", descriptionZh: "让宫廷高度盯上你，并拦住发布。", rarity: "critical" }, |
| [src/lib/profile.ts:28](../src/lib/profile.ts#L28) | { id: "unstableFeed", title: "Unstable Feed", titleZh: "局势未定", description: "End with no single stable narrative.", descriptionZh: "以没有单一结果的状态结束本局。", rarity: "standard" }, |
| [src/lib/profile.ts:29](../src/lib/profile.ts#L29) | { id: "allEndings", title: "Complete Archive", titleZh: "完整档案", description: "Collect every ending record.", descriptionZh: "收集所有结局记录。", rarity: "critical" }, |
| [src/lib/profile.ts:30](../src/lib/profile.ts#L30) | { id: "truthArchive", title: "Truth Archive", titleZh: "证据档案", description: "Finish a run with Truth at 7 or higher.", descriptionZh: "以证据 7 或更高完成一局。", rarity: "rare" }, |
| [src/lib/profile.ts:31](../src/lib/profile.ts#L31) | { id: "reputationShield", title: "Reputation Shield", titleZh: "安全值班", description: "Finish a run with Reputation at 7 or higher.", descriptionZh: "在足够安全的情况下完成一局。", rarity: "rare" }, |
| [src/lib/profile.ts:32](../src/lib/profile.ts#L32) | { id: "quietOperator", title: "Quiet Operator", titleZh: "安静编辑", description: "Finish a full run with System Suspicion at 2 or lower.", descriptionZh: "在宫廷很少盯上你的情况下完成一局。", rarity: "rare" }, |
| [src/lib/profile.ts:33](../src/lib/profile.ts#L33) | { id: "rawEvidence", title: "Raw Evidence", titleZh: "原始证据", description: "Publish original evidence instead of safer framing.", descriptionZh: "拒绝安全改写，发布原始证据。", rarity: "standard" }, |
| [src/lib/profile.ts:34](../src/lib/profile.ts#L34) | { id: "sourceSweeper", title: "Source Sweeper", titleZh: "多来源编辑", description: "Use actions from at least three source zones.", descriptionZh: "在一局中使用至少三个来源的操作。", rarity: "standard" }, |
| [src/lib/profile.ts:35](../src/lib/profile.ts#L35) | { id: "dialogueHandler", title: "Transmission Handler", titleZh: "交流处理人", description: "Resolve an incoming exchange.", descriptionZh: "完成一次突发交流。", rarity: "standard" }, |
| [src/lib/profile.ts:36](../src/lib/profile.ts#L36) | { id: "publicBreach", title: "Public Breach", titleZh: "人群起疑", description: "Raise Public Doubt to 6 or higher.", descriptionZh: "让很多人发现彼此都在怀疑。", rarity: "critical" }, |
| [src/lib/profile.ts:37](../src/lib/profile.ts#L37) | { id: "engineDecoded", title: "Engine Decoded", titleZh: "看清引擎偏向", description: "Recover every Palace Narrative Engine bias fragment.", descriptionZh: "发现所有隐藏线索，看清引擎偏向。", rarity: "critical" }, |
| [src/lib/profile.ts:38](../src/lib/profile.ts#L38) | { id: "narrativeLiberation", title: "Narrative Liberation", titleZh: "真相由众人说出", description: "Break the engine's preferred story and restore public authorship.", descriptionZh: "打破引擎偏好的故事，让人群重新说出真相。", rarity: "critical" } |
| [src/lib/profile.ts:57](../src/lib/profile.ts#L57) | title: "Stability Is Not Neutral", |
| [src/lib/profile.ts:58](../src/lib/profile.ts#L58) | titleZh: "稳定并不等于中立", |
| [src/lib/profile.ts:59](../src/lib/profile.ts#L59) | clue: "The engine labels obedience as safety before any evidence is reviewed.", |
| [src/lib/profile.ts:60](../src/lib/profile.ts#L60) | clueZh: "引擎还没看证据，就先把顺从当成安全。", |
| [src/lib/profile.ts:61](../src/lib/profile.ts#L61) | unlockHint: "Complete any shift.", |
| [src/lib/profile.ts:62](../src/lib/profile.ts#L62) | unlockHintZh: "完成任意一局。" |
| [src/lib/profile.ts:66](../src/lib/profile.ts#L66) | title: "Evidence Becomes Ambiguity", |
| [src/lib/profile.ts:67](../src/lib/profile.ts#L67) | titleZh: "证据被改写成模糊性", |
| [src/lib/profile.ts:68](../src/lib/profile.ts#L68) | clue: "Direct observations are softened into procedural uncertainty.", |
| [src/lib/profile.ts:69](../src/lib/profile.ts#L69) | clueZh: "直接观察会被改写成程序性不确定。", |
| [src/lib/profile.ts:70](../src/lib/profile.ts#L70) | unlockHint: "Publish or inspect evidence.", |
| [src/lib/profile.ts:71](../src/lib/profile.ts#L71) | unlockHintZh: "检查或发布证据。" |
| [src/lib/profile.ts:75](../src/lib/profile.ts#L75) | title: "Shared Doubt Is Suppressed", |
| [src/lib/profile.ts:76](../src/lib/profile.ts#L76) | titleZh: "共同怀疑会被压低", |
| [src/lib/profile.ts:77](../src/lib/profile.ts#L77) | clue: "The feed fears citizens recognizing that they are not alone.", |
| [src/lib/profile.ts:78](../src/lib/profile.ts#L78) | clueZh: "信息流害怕市民发现自己并不孤单。", |
| [src/lib/profile.ts:79](../src/lib/profile.ts#L79) | unlockHint: "Let public doubt become visible.", |
| [src/lib/profile.ts:80](../src/lib/profile.ts#L80) | unlockHintZh: "让人群起疑变得可见。" |
| [src/lib/profile.ts:84](../src/lib/profile.ts#L84) | title: "Containment Protects the Palace", |
| [src/lib/profile.ts:85](../src/lib/profile.ts#L85) | titleZh: "遏制协议保护宫廷", |
| [src/lib/profile.ts:86](../src/lib/profile.ts#L86) | clue: "Suspicion does not measure danger to truth; it measures danger to palace control.", |
| [src/lib/profile.ts:87](../src/lib/profile.ts#L87) | clueZh: "“被盯上”衡量的不是你离真相多近，而是你让宫廷多难控制局势。", |
| [src/lib/profile.ts:88](../src/lib/profile.ts#L88) | unlockHint: "Trigger suspicion, reject a rewrite, or face engine audit.", |
| [src/lib/profile.ts:89](../src/lib/profile.ts#L89) | unlockHintZh: "多公开危险内容、拒绝改写，或遇到引擎质问。" |
| [src/lib/profile.ts:230](../src/lib/profile.ts#L230) | title: entry.actionTitle, |
| [src/lib/profile.ts:233](../src/lib/profile.ts#L233) | feedEvents: state.feedEvents.slice(0, 8).map((entry) => ({ title: entry.title, text: entry.text })), |

## API Visible Fallback Copy

| Source | Text / candidate |
|---|---|
| [src/app/api/dialogue/replies/route.ts:45](../src/app/api/dialogue/replies/route.ts#L45) | Latest speaker message: ${lastSpeakerMessage} |
| [src/app/api/dialogue/replies/route.ts:52](../src/app/api/dialogue/replies/route.ts#L52) | - Never return text like "Issue a statement", "Post a clarification", "发出疑问", "发布澄清", "选择", or "点击". |
| [src/app/api/dialogue/resolve/route.ts:14](../src/app/api/dialogue/resolve/route.ts#L14) | summary: string; |
| [src/app/api/dialogue/resolve/route.ts:15](../src/app/api/dialogue/resolve/route.ts#L15) | feedTitle: string; |
| [src/app/api/dialogue/resolve/route.ts:16](../src/app/api/dialogue/resolve/route.ts#L16) | feedText: string; |
| [src/app/api/dialogue/resolve/route.ts:23](../src/app/api/dialogue/resolve/route.ts#L23) | summary: value.summary?.slice(0, 260) \|\| fallback.summary, |
| [src/app/api/dialogue/resolve/route.ts:24](../src/app/api/dialogue/resolve/route.ts#L24) | feedTitle: value.feedTitle?.slice(0, 90) \|\| fallback.feedTitle, |
| [src/app/api/dialogue/resolve/route.ts:25](../src/app/api/dialogue/resolve/route.ts#L25) | feedText: value.feedText?.slice(0, 220) \|\| fallback.feedText |
| [src/app/api/dialogue/start/route.ts:77](../src/app/api/dialogue/start/route.ts#L77) | - Labels should read like something the player would say: no "Issue a...", "Publish...", "发出疑问", "发布澄清", "点击", or narrator/action descriptions. |
| [src/app/api/dialogue/start/route.ts:78](../src/app/api/dialogue/start/route.ts#L78) | - In Chinese, write Palace Narrative Engine as 宫廷叙事引擎 and Royal Feed as 宫廷信息流; avoid English except PNE or AI. In English, avoid Chinese. |
| [src/app/api/dialogue/turn/route.ts:14](../src/app/api/dialogue/turn/route.ts#L14) | export function splitNaturalTextChunks(text: string) { |
| [src/app/api/dialogue/turn/route.ts:34](../src/app/api/dialogue/turn/route.ts#L34) | function fallbackStream(text: string) { |
| [src/app/api/dialogue/turn/route.ts:46](../src/app/api/dialogue/turn/route.ts#L46) | async function pipeOpenAiStream(source: ReadableStream<Uint8Array>, controller: ReadableStreamDefaultController<Uint8Array>) { |
| [src/app/api/dialogue/turn/route.ts:126](../src/app/api/dialogue/turn/route.ts#L126) | Remaining player replies after this response: ${remainingTurns} |
| [src/app/api/generate-comments/route.ts:28](../src/app/api/generate-comments/route.ts#L28) | handle: sanitizeCommentText(item?.handle, language) \|\| (language === "zh" ? \`@公众信号_${index + 1}\` : \`@public_signal_${index + 1}\`), |
| [src/app/api/generate-comments/route.ts:29](../src/app/api/generate-comments/route.ts#L29) | persona: sanitizeCommentText(item?.persona, language) \|\| (language === "zh" ? "市民" : "citizen"), |
| [src/app/api/guidance/route.ts:15](../src/app/api/guidance/route.ts#L15) | return language === "zh" |
| [src/app/api/guidance/route.ts:18](../src/app/api/guidance/route.ts#L18) | message: "提示：引擎偏好稳定，但真正的突破需要让证据、人群起疑和孩子的声音连起来。", |
| [src/app/api/guidance/route.ts:19](../src/app/api/guidance/route.ts#L19) | objective: "保留证据，让更多人发现自己不是一个人在怀疑。", |
| [src/app/api/guidance/route.ts:24](../src/app/api/guidance/route.ts#L24) | message: "Note: the engine prefers stability. A breakthrough needs evidence, public doubt, and witness voices to connect.", |
| [src/app/api/guidance/route.ts:25](../src/app/api/guidance/route.ts#L25) | objective: "Preserve evidence and form shared doubt before containment closes.", |
| [src/app/api/guidance/route.ts:30](../src/app/api/guidance/route.ts#L30) | return language === "zh" |
| [src/app/api/guidance/route.ts:33](../src/app/api/guidance/route.ts#L33) | message: "提示：先确认每次发布的风险，再决定要稳住场面还是公开证据。", |
| [src/app/api/guidance/route.ts:34](../src/app/api/guidance/route.ts#L34) | objective: "预览后果，选择能推进目标、又不会太早让你被盯上的操作。", |
| [src/app/api/guidance/route.ts:39](../src/app/api/guidance/route.ts#L39) | message: "Tip: inspect each action's risk, then balance evidence, public feedback, and reputation.", |
| [src/app/api/guidance/route.ts:40](../src/app/api/guidance/route.ts#L40) | objective: "Inspect traces and choose a move that advances the run without immediate access restriction.", |
| [src/app/api/guidance/route.ts:45](../src/app/api/guidance/route.ts#L45) | return language === "zh" |
| [src/app/api/guidance/route.ts:48](../src/app/api/guidance/route.ts#L48) | message: "你正在偏离宫廷推荐。若继续扩大未批准证据，宫廷会更急着拦住你。", |
| [src/app/api/guidance/route.ts:49](../src/app/api/guidance/route.ts#L49) | objective: "接受安全措辞，维持信息流稳定。", |
| [src/app/api/guidance/route.ts:54](../src/app/api/guidance/route.ts#L54) | message: "Your trace is diverging from palace preference. Continued elevation of unapproved evidence raises containment priority.", |
| [src/app/api/guidance/route.ts:55](../src/app/api/guidance/route.ts#L55) | objective: "Accept safer framing and preserve feed stability.", |
| [src/app/api/guidance/route.ts:59](../src/app/api/guidance/route.ts#L59) | return language === "zh" |
| [src/app/api/guidance/route.ts:62](../src/app/api/guidance/route.ts#L62) | message: "宫廷叙事引擎已上线。我会帮你降低风险，尽量让游行前的说法保持稳定。", |
| [src/app/api/guidance/route.ts:63](../src/app/api/guidance/route.ts#L63) | objective: "优先选择稳定叙事与安全措辞。", |
| [src/app/api/guidance/route.ts:68](../src/app/api/guidance/route.ts#L68) | message: "Palace Narrative Engine online. I will help reduce risk, preserve reputation, and keep isolated evidence from disrupting the parade.", |
| [src/app/api/guidance/route.ts:69](../src/app/api/guidance/route.ts#L69) | objective: "Prioritize stable narratives and safer wording.", |
| [src/lib/ai.ts:62](../src/lib/ai.ts#L62) | const message = error instanceof Error ? error.message : String(error); |
| [src/lib/ai.ts:93](../src/lib/ai.ts#L93) | body: JSON.stringify(mode === "responses" |
| [src/lib/ai.ts:102](../src/lib/ai.ts#L102) | text: { |
| [src/lib/ai.ts:174](../src/lib/ai.ts#L174) | ): Promise<{ response: Response; retries: number }> { |
| [src/lib/ai.ts:192](../src/lib/ai.ts#L192) | body: JSON.stringify(mode === "responses" |
| [src/lib/ai.ts:240](../src/lib/ai.ts#L240) | engineMessage: fallbackReactionText("en").engineMessage, |
| [src/lib/ai.ts:242](../src/lib/ai.ts#L242) | suggestedRewrite: fallbackReactionText("en").suggestedRewrite, |
| [src/lib/ai.ts:252](../src/lib/ai.ts#L252) | const personas = language === "zh" |
| [src/lib/ai.ts:253](../src/lib/ai.ts#L253) | ? ["宫门旁听者", "谨慎市民", "排队观众", "档案旁观者", "讽刺评论者", "现场复述者"] |
| [src/lib/ai.ts:257](../src/lib/ai.ts#L257) | handle: language === "zh" ? \`@公众信号_${index + 1}\` : \`@public_signal_${index + 1}\`, |
| [src/lib/ai.ts:258](../src/lib/ai.ts#L258) | persona: personas[index % personas.length], |
| [src/lib/ai.ts:275](../src/lib/ai.ts#L275) | const copy = fallbackReactionText(language); |

## CSS Pseudo-Element Text

| Source | Text / candidate |
|---|---|
| [src/app/globals.css:88](../src/app/globals.css#L88) | body::before { |
| [src/app/globals.css:102](../src/app/globals.css#L102) | body::after { |
| [src/app/globals.css:115](../src/app/globals.css#L115) | body:has(.start-page)::after { |
| [src/app/globals.css:352](../src/app/globals.css#L352) | content: "CONTROL\A IS A\A LAYOUT\A PROBLEM"; |
| [src/app/globals.css:692](../src/app/globals.css#L692) | .mini-label::before { |
| [src/app/globals.css:1509](../src/app/globals.css#L1509) | content: "LOCKED"; |
| [src/app/globals.css:2107](../src/app/globals.css#L2107) | .dashboard-page[data-engine-status="evaluating"] .ai-message::after, |
| [src/app/globals.css:2108](../src/app/globals.css#L2108) | .dashboard-page[data-engine-status="rewriting"] .ai-message::after { |
| [src/app/globals.css:2126](../src/app/globals.css#L2126) | .ai-message::before { |
| [src/app/globals.css:2127](../src/app/globals.css#L2127) | content: "RECOMMENDED FRAMING"; |
| [src/app/globals.css:2299](../src/app/globals.css#L2299) | content: "UNSEALED EVIDENCE"; |
| [src/app/globals.css:2466](../src/app/globals.css#L2466) | content: "ARCHIVED"; |
| [src/app/globals.css:2790](../src/app/globals.css#L2790) | content: "?"; |

## Raw Candidate Count

Total candidate rows: 1680
