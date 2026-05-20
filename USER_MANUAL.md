# TalentFlow AI - User Manual

## End-to-End Talent Fulfillment Platform

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Demand Management](#demand-management)
4. [Candidate Management](#candidate-management)
5. [AI Role Matching](#ai-role-matching)
6. [Vendor Management](#vendor-management)
7. [Hire Management](#hire-management)
8. [Margin Forecasting](#margin-forecasting)
9. [Demo Tips](#demo-tips)

---

## Getting Started

### Login
1. Navigate to `http://localhost:3000`
2. Enter any email address (e.g., `demo@talentflow.ai`)
3. Click **Sign In** to access the platform

### Navigation
The top navigation bar provides access to all sections:
- **Dashboard** - Overview and analytics
- **Demands** - Job demand management
- **Candidates** - Talent pool
- **Vendors** - Partner management
- **Hires** - Hire records and forecasting

---

## Dashboard Overview

The dashboard provides a real-time overview of your talent operations.

### Key Metrics Cards

| Metric | Description |
|--------|-------------|
| **Total Demands** | All job demands in the system |
| **Open Demands** | Currently active, unfilled positions |
| **Total Candidates** | Talent pool size |
| **Hot Talents** | Candidates flagged as high-priority |
| **Projected Margin** | 12-month margin forecast from all hires |
| **Revenue at Risk** | Potential revenue from unfilled positions |

### Charts

**Demands by Priority** (Bar Chart)
- Visual breakdown of demands by priority level (High/Medium/Low)
- Color-coded: Red=High, Yellow=Medium, Green=Low

**Demands by Status** (Pie Chart)
- Pipeline view: Open → In Progress → Interview → Offer → Filled

**Margin Forecasting** (Summary Cards)
- Total Projected 12M Margin
- Active Hires count
- Revenue at Risk

---

## Demand Management

### View All Demands
Navigate to **Demands** to see all job requirements.

The table displays:
- **Title** - Job position name
- **Priority** - High (red flame icon), Medium, Low
- **Status** - Pipeline stage (Open, In Progress, Interview, Offer, Filled)
- **Rate Range** - Hourly rate ($/hr)
- **Location** - Job location or "Remote"
- **Skills** - Required skills badges
- **Matches** - Number of candidate matches

### Create New Demand
1. Click **Create Demand** button
2. Fill in the form:
   - **Job Title** - Position name (e.g., "Senior Full Stack Developer")
   - **Location** - Office location or "Remote"
   - **Job Description** - Detailed requirements
   - **Required Skills** - Comma-separated (e.g., `React, TypeScript, Node.js`)
   - **Rate Min** - Minimum hourly rate ($/hr)
   - **Rate Max** - Maximum hourly rate ($/hr)
   - **Priority** - High/Medium/Low
   - **Vendor** - Optional partner assignment
3. Click **Create Demand**

### Update Demand Status
1. Click the status dropdown on any demand row
2. Select new status: Open → In Progress → Interview → Offer → Filled
3. Status updates immediately

### Delete Demand
1. Click **Delete** button on the demand row
2. Confirm deletion (cannot be undone)

---

## Candidate Management

### View All Candidates
Navigate to **Candidates** to see the talent pool.

The table displays:
- **Name** - Candidate full name (flame icon if hot talent)
- **Contact** - Email and phone
- **Skills** - Extracted skill badges
- **Experience** - Years of experience
- **CTC** - Current and expected salary
- **Status** - Available, Interviewing, Offered, Hired
- **Hot** - Hot talent indicator

### Hot Talents Banner
Candidates with high match scores and rare skills are flagged as **Hot Talent** and shown in an orange banner at the top of the page.

### Add New Candidate
1. Click **Add Candidate** button
2. Fill in the form:
   - **Full Name** - Candidate name
   - **Email** - Contact email
   - **Phone** - Contact number
   - **Experience (Years)** - Total years of experience
   - **Current CTC** - Current compensation
   - **Expected CTC** - Expected compensation
   - **Skills** - Comma-separated (e.g., `React, Python, AWS`)
3. Click **Add Candidate**

### Run AI Matching
Click **Run AI Matching** to:
- Score all available candidates against all open demands
- Automatically flag hot talents based on match quality
- Create match records with scoring

---

## AI Role Matching

### How It Works
TalentFlow AI uses a weighted scoring algorithm:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Skill Overlap** | 50% | Match between candidate skills and job requirements |
| **Experience Fit** | 30% | Alignment of experience years with requirements |
| **Rate Compatibility** | 20% | Expected CTC within job rate range |

### Match Scoring

| Score | Interpretation |
|-------|----------------|
| **90-100** | Excellent fit - Highly recommended |
| **75-89** | Strong fit - Good candidate |
| **60-74** | Moderate fit - May need upskilling |
| **Below 60** | Weak fit - Not recommended |

### Match Output
For each candidate-demand pair:
- **Match Score** - 0-100 numerical score
- **Match Reason** - Natural language explanation (e.g., "Strong fit with 6/8 skills matched and 5 years experience")

---

## Vendor Management

### View Vendors
Navigate to **Vendors** to manage recruitment partners.

Each vendor card shows:
- **Name** - Company name
- **Contact** - Contact person and email
- **Commission Rate** - Percentage (e.g., 10%)
- **Performance Score** - 5-star rating
- **Demands** - Number of assigned demands
- **Hires** - Number of successful placements

### Add New Vendor
1. Click **Add Vendor** button
2. Fill in the form:
   - **Company Name** - Vendor company name
   - **Contact Person** - Primary contact
   - **Email** - Contact email
   - **Commission Rate** - Percentage (e.g., 8, 10, 12)
3. Click **Add Vendor**

### Vendor Performance
Performance scores are calculated based on:
- Submission-to-hire ratio
- Time-to-fill metrics
- Quality ratings

---

## Hire Management

### View Hires
Navigate to **Hires** to track all successful placements.

The table displays:
- **Candidate** - Hired candidate name
- **Demand** - Job position filled
- **Vendor** - Partner who sourced the candidate
- **Hired Rate** - Hourly rate at hiring
- **Hiring Cost** - One-time recruitment cost
- **Start Date** - Employment start date
- **Projected Margin (12M)** - 12-month margin forecast
- **Status** - Active, Completed, Cancelled

### Record New Hire
1. Click **Record Hire** button
2. Fill in the form:
   - **Demand** - Select the job position being filled
   - **Candidate** - Select the candidate being hired
   - **Vendor** - Optional (if sourced through partner)
   - **Hired Rate** - Negotiated hourly rate
   - **Hiring Cost** - One-time cost (typically $3,000-$12,000)
   - **Start Date** - Employment start date
3. Click **Record Hire**

**Note:** Recording a hire automatically:
- Updates demand status to "Filled"
- Updates candidate status to "Hired"
- Calculates 12-month margin projection

### Delete Vendor
Click **Delete** on any vendor card (cannot be undone if has associated demands/hires)

---

## Margin Forecasting

### How It Works
TalentFlow AI calculates profitability for each hire:

```
Monthly Margin = Bill Rate - (Pay Rate + Monthly Hiring Cost Amortized)

Where:
- Monthly Hiring Cost = Hiring Cost / 12
- Bill Rate = Client hourly rate (typically 1.3-1.5x pay rate)
- Pay Rate = Candidate's hourly cost

Projected Margin (12M) = Monthly Margin x 12
```

### Example Calculation

| Metric | Value |
|--------|-------|
| Bill Rate (Client) | $150/hr |
| Pay Rate (Candidate) | $100/hr |
| One-Time Hiring Cost | $6,000 |
| Monthly Hiring Cost Amortized | $500 |
| Monthly Margin | $150 - ($100 + $500) = $49,500 |
| **12-Month Projected Margin** | **$49,500 x 12 = $594,000** |

### Break-Even Analysis
The system calculates how many months to recover hiring investment:
```
Break-Even Months = Hiring Cost / Monthly Margin
```

### Margin Dashboard
View margin forecasting at:
- **Individual hire level** - Each hire card shows projected margin
- **Aggregate level** - Total projected margin across all hires
- **Comparison views** - By vendor, skill category, location

---

## Demo Tips

### For Hackathon Presentations

**1. Start with the Pain Point**
> "Average time-to-hire is 44 days. Every delayed hire costs $2,000/day in lost revenue. TalentFlow AI cuts this to 5 days."

**2. Demo Flow (5 minutes)**

| Step | Time | Action |
|------|------|--------|
| 1 | 30s | Show Dashboard - highlight hot talents and projected margin |
| 2 | 1min | Create a new demand - demonstrate auto-skill parsing |
| 3 | 1min | Add a candidate - show skill extraction |
| 4 | 1min | Run AI Matching - show match scoring |
| 5 | 1min | Record a hire - show 12-month margin projection |
| 6 | 30s | Pan across all dashboards |

**3. Key Metrics to Highlight**
- Total Projected Margin (impresses business judges)
- Hot Talent count (shows AI sophistication)
- Revenue at Risk (demonstrates urgency)
- Match quality scores (proves AI capability)

**4. Talking Points**
- "No other platform has 12-month margin forecasting"
- "Touchless requirement processing from email-to-job"
- "AI matching considers 50% skills, 30% experience, 20% rate fit"
- "Hot Talent auto-flagging based on match quality and skill rarity"

---

## API Endpoints

For developers integrating with TalentFlow AI:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demands` | List all demands |
| POST | `/api/demands` | Create demand |
| GET | `/api/candidates` | List all candidates |
| POST | `/api/candidates` | Create candidate |
| POST | `/api/matches/batch` | Run AI matching |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/hires` | List all hires |
| POST | `/api/hires` | Record new hire |
| GET | `/api/vendors` | List all vendors |
| POST | `/api/vendors` | Create vendor |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Go to Dashboard | `G then D` |
| Go to Demands | `G then J` |
| Go to Candidates | `G then C` |
| Create New (context) | `N` |
| Search | `/` |

---

## Support

For technical issues or questions:
- Check the GitHub Issues page
- Review the design document: `Designflow.docx`

---

*TalentFlow AI v1.0 - Built for Vibeathon Hackathon 2026*