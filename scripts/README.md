# Dermodel Scripts

Collection of data population scripts for the Dermodel v2 project.

---

## 📚 Semantic Scholar Paper Fetcher

Populates the `ingredient_references_master` table with research papers from Semantic Scholar.

### Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

2. **Set your Supabase service role key:**
   ```bash
   # Option 1: Environment variable (recommended)
   export SUPABASE_SERVICE_KEY="your-service-role-key-here"

   # Option 2: Edit the script directly (line 30)
   ```

   > Find your service role key: Supabase Dashboard > Settings > API > service_role

3. **(Optional) Get Semantic Scholar API key for higher rate limits:**
   ```bash
   export SEMANTIC_SCHOLAR_KEY="your-api-key"
   ```
   > Get one at: https://www.semanticscholar.org/product/api

### Usage

```bash
cd scripts
python populate_papers.py
```

### Features

- **4 papers per ingredient** - Fetches top relevant papers
- **Checkpointing** - Safe to stop and resume (Ctrl+C)
- **Rate limiting** - 3 second delay between API calls
- **Deduplication** - Skips duplicate DOIs
- **Logging** - All activity logged to `populate_papers.log`

### Files Generated

- `checkpoint.json` - Progress tracking (auto-resume)
- `populate_papers.log` - Activity log

### Time Estimate

- ~30,000 ingredients × 3 sec = **~25 hours**
- Can run overnight, stop/resume anytime
- With API key: potentially faster (higher rate limits)

### Troubleshooting

**Rate limited (429 error)?**
- Script auto-waits 60 seconds and retries
- Consider getting an API key for higher limits

**Database insert errors?**
- Check your service role key has write permissions
- Ensure `ingredient_references_master` table exists

**Want to start fresh?**
- Delete `checkpoint.json` to reset progress
