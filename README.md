<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1d_Azbvz91y2ckIVk93gICCJ55V25luPP

## Deploy to Vercel

1. **Import the repository** into Vercel.
2. If the project is nested, set the **Root Directory** to `hlhengenhariateste`.
3. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
4. Vercel will automatically detect the Vite setup and deploy the app.
