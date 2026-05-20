# Interaktyvios šalių svetainės (darbo failai)

Interaktyvi svetainė apie pasaulio šalis, kurioje galima: pasirinkti šalis and žemėlapio, analizuoti šalių duoemnis ir kita.

## Struktūra

"dataTransformation" - duomenų apdirbimas ir įkėlimas į duomenų bazę. Tuo pačiu šių duomenų išsaugojimas duomenų bazėje
"website" - full-stack SvelteKit realizacija svetainės

## Pasiledimas

Abi sistemos buvo parašytos naudojant JavaScript ir TypeScript per VSCode.
Operacinė sistema naudota Windows 10 WSL

### Reikalavimai pasileidimui

- pnpm
- Docker

Norit pasileisti vieną iš dviejų sistemų tame aplanke reikia panaudoti komandą `pnpm install`

### "dataTransformation"

Šiai versijai projekto pasileisti reikalinga turėti duomenų bazę kitaip puslapis nepasileis. Yra sukurtas transformuotų duomenų failas "database_dump.sql", kurį galima įkelti arba galima pačiam sugeneruoti duoemenis "dataTransformation" aplanke atkomentavus dataTransformation/src/index.ts faile `// await persistToDb(results);` funkiją.

### "website"

Svetainės pasileidimui website/.env faile priderinti/pakeisti duoemnų bazės nuorodą jei skiriasi ir naudoti savo Gemini AI API raktą.
Tuomet galima naudoti `pnpm dev` pasileidimui kūrimo aplinkoje.
