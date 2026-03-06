# Deploy del Worker en Cloudflare Dashboard

1. Ir a cloudflare.com → Workers & Pages → Create Worker
2. Pegar el contenido de inject-meta.js
3. En Settings → Variables añadir:
   - SUPABASE_URL_ENV = https://[tu-proyecto].supabase.co
   - SUPABASE_ANON_KEY_ENV = [tu anon key pública]
4. En el Worker, ir a Triggers → Add Route:
   - Route: guiadelsalon.com/*
   - Zone: guiadelsalon.com
5. Save and Deploy

# Validación post-deploy
curl -s https://guiadelsalon.com/categorias/planchas-de-pelo | grep "meta name"
curl -s https://guiadelsalon.com/blog/balayage-vs-mechas-diferencias-que-debes-conocer | grep "meta name"

Ambos deben mostrar descripciones distintas entre sí.
