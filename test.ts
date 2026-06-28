fetch('http://localhost:3000/api/identities').then(r=>r.json()).then(r => console.log(r.length)).catch(console.error)
