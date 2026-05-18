# Content Generation & Update Guide

## 🎯 Overview

This guide explains how to generate fresh, updated content for AI Buzz World to keep your site current and improve SEO rankings.

---

## 📅 Content Update Strategy

### Daily Tasks
- Monitor new AI tool releases
- Check tool websites for updates
- Track trending topics

### Weekly Tasks
- Generate "New Tools This Week" article
- Update 5-10 tool entries
- Publish 1-2 blog posts
- Share on social media

### Monthly Tasks
- Update all old articles
- Generate "Top Tools This Month"
- Refresh tool information
- Analyze content performance

---

## 🤖 Automated Content Generation

### Existing Scripts

#### 1. `scripts/generateContent.js`
**What it does:**
- Generates articles using DeepSeek API
- Creates tool data
- Generates categories

**How to use:**
```bash
# Set your API key
export DEEPSEEK_API_KEY="your-key-here"

# Generate content
yarn generate:content

# Or specify number of articles
ARTICLES_TO_GENERATE=5 yarn generate:content
```

**Limitations:**
- Generates generic content
- Doesn't check for updates
- No real-time data

#### 2. `scripts/generateComprehensiveContent.js`
**What it does:**
- Generates tools and articles by category
- More structured approach

**How to use:**
```bash
yarn generate:all-content
```

### New Scripts Needed

#### 1. Update Tool Information
**File:** `scripts/updateToolInfo.js`

**Purpose:**
- Check tool websites for changes
- Update pricing, features, descriptions
- Add "lastUpdated" timestamp

**Implementation:**
```javascript
// Pseudo-code
async function updateToolInfo() {
  const tools = await getTools();
  
  for (const tool of tools) {
    // Check website for updates
    const latestInfo = await fetchToolInfo(tool.website);
    
    // Compare with current data
    if (hasChanges(tool, latestInfo)) {
      // Update tool data
      await updateTool(tool.id, latestInfo);
      tool.lastUpdated = new Date();
    }
  }
}
```

#### 2. Generate Weekly News
**File:** `scripts/generateWeeklyNews.js`

**Purpose:**
- Create "New AI Tools This Week" article
- Include trending topics
- Highlight tool updates

**Implementation:**
```javascript
async function generateWeeklyNews() {
  // Get new tools from this week
  const newTools = await getNewToolsThisWeek();
  
  // Get trending topics
  const trends = await getTrendingTopics();
  
  // Generate article
  const article = await generateArticle({
    title: `New AI Tools This Week - ${getCurrentWeek()}`,
    content: formatWeeklyNews(newTools, trends),
    category: 'News',
    featured: true
  });
  
  return article;
}
```

#### 3. Refresh Old Content
**File:** `scripts/refreshOldContent.js`

**Purpose:**
- Find articles older than 3 months
- Update with current information
- Refresh dates and statistics

**Implementation:**
```javascript
async function refreshOldContent() {
  const articles = await getArticles();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const oldArticles = articles.filter(
    article => new Date(article.updatedAt) < threeMonthsAgo
  );
  
  for (const article of oldArticles) {
    // Update content
    const updated = await updateArticleContent(article);
    updated.updatedAt = new Date();
    await saveArticle(updated);
  }
}
```

---

## 📝 Content Types to Generate

### 1. New Tool Announcements
**Frequency:** Weekly  
**Template:**
- Title: "New AI Tools This Week - [Date]"
- Content: List of 5-10 new tools
- Include: Tool name, description, category, link

**Example:**
```markdown
# New AI Tools This Week - March 14, 2026

## 1. ToolName
**Category:** Writing & Content
**Description:** Brief description
**Website:** [Link]
**Pricing:** Free/Freemium/Paid

## 2. AnotherTool
...
```

### 2. Tool of the Week
**Frequency:** Weekly  
**Template:**
- Deep dive into one tool
- Use cases
- Pros and cons
- Comparison with alternatives

### 3. Comparison Articles
**Frequency:** Monthly  
**Template:**
- "Tool A vs Tool B: Which is Better?"
- Side-by-side comparison
- Use case recommendations
- Pricing comparison

### 4. Category Guides
**Frequency:** Monthly  
**Template:**
- "Best AI Tools for [Category] in 2026"
- Top 10-15 tools
- Detailed reviews
- Use case examples

### 5. Trend Reports
**Frequency:** Monthly  
**Template:**
- "Top 10 AI Tools This Month"
- Trending topics
- Industry news
- Predictions

---

## 🔍 Finding New Content Sources

### 1. Product Hunt
- Check daily for new AI tools
- Track upvotes and comments
- Note release dates

### 2. AI News Sites
- The Verge AI section
- TechCrunch AI
- VentureBeat AI
- AI News

### 3. Social Media
- Twitter/X: #AItools, #AI
- LinkedIn: AI tool posts
- Reddit: r/artificial, r/MachineLearning

### 4. GitHub
- Search for "AI tools" repositories
- Check trending AI projects
- Monitor new releases

### 5. Tool Directories
- AlternativeTo
- Product Hunt
- G2
- Capterra

---

## 🛠️ Manual Content Updates

### Updating Tool Information

1. **Check Tool Website**
   - Visit tool's website
   - Check for updates
   - Note new features
   - Check pricing changes

2. **Update JSON File**
   ```json
   {
     "name": "Tool Name",
     "updatedAt": "2026-03-14T00:00:00.000Z",
     "lastUpdated": "2026-03-14T00:00:00.000Z",
     "features": ["Updated feature list"],
     "pricing": "Updated pricing"
   }
   ```

3. **Update Article References**
   - If tool mentioned in articles, update
   - Add "Last Updated" note
   - Refresh statistics

### Updating Articles

1. **Review Old Articles**
   - Check publication date
   - Review content accuracy
   - Update statistics
   - Refresh examples

2. **Add Update Notice**
   ```markdown
   > **Last Updated:** March 14, 2026
   > This article has been updated with the latest information.
   ```

3. **Refresh Content**
   - Update tool mentions
   - Add new tools
   - Remove discontinued tools
   - Update pricing information

---

## 📊 Content Calendar Template

### Weekly Schedule

**Monday:**
- Generate "New Tools This Week" article
- Update 5 tool entries
- Share on social media

**Wednesday:**
- Publish comparison article
- Update old articles
- Check tool websites

**Friday:**
- Publish category guide
- Generate tool of the week
- Plan next week's content

### Monthly Schedule

**Week 1:**
- "Top Tools This Month"
- Category deep-dive
- Update all tool information

**Week 2:**
- Comparison articles
- Trend reports
- Industry analysis

**Week 3:**
- How-to guides
- Tutorial content
- Use case studies

**Week 4:**
- Refresh old content
- Update statistics
- Plan next month

---

## 🚀 Quick Start: Generate Fresh Content Today

### Step 1: Update Existing Content
```bash
# Update tool information
node scripts/updateToolInfo.js

# Refresh old articles
node scripts/refreshOldContent.js
```

### Step 2: Generate New Content
```bash
# Generate weekly news
node scripts/generateWeeklyNews.js

# Generate new articles
ARTICLES_TO_GENERATE=3 yarn generate:content
```

### Step 3: Update Dates
- Change all `publishedAt` dates to current date
- Update `updatedAt` dates
- Add `lastUpdated` to tools

### Step 4: Publish
- Review generated content
- Make manual edits
- Publish to site
- Share on social media

---

## 💡 Pro Tips

1. **Automate What You Can**
   - Set up cron jobs for weekly updates
   - Use APIs to check tool websites
   - Automate social media posting

2. **Quality Over Quantity**
   - Better to have fewer, high-quality articles
   - Focus on accuracy and usefulness
   - Update existing content regularly

3. **Track Performance**
   - Monitor which content performs best
   - Focus on high-performing topics
   - Update low-performing content

4. **Stay Current**
   - Follow AI news daily
   - Join AI communities
   - Monitor competitor sites

5. **User Feedback**
   - Listen to user comments
   - Answer questions in articles
   - Update based on feedback

---

## 📚 Resources

### APIs for Tool Discovery
- Product Hunt API
- GitHub API
- Twitter API (for trending)

### Content Ideas
- Answer common questions
- Cover trending topics
- Compare popular tools
- Tutorial content

### Tools for Content
- Grammarly (editing)
- Hemingway (readability)
- SurferSEO (SEO)
- Originality.ai (AI detection)

---

**Remember:** Fresh, accurate content is key to SEO success and user trust. Update regularly!
