// Récupère les horaires du Centre Musulman de Clamart (MAWAQIT) et écrit horaires.json.
// Si MAWAQIT échoue, lit le tableau du site m2m-meudon.fr. Si tout échoue, ne modifie rien.
import fs from 'fs';
const H={'User-Agent':'Mozilla/5.0'};
async function mawaqit(){
  const html=await (await fetch('https://mawaqit.net/fr/mon-domicile-clamart-tv',{headers:H})).text();
  const i=html.indexOf('confData');if(i<0)throw new Error('confData introuvable');
  const a=html.indexOf('{',i);let d=0,j=a;
  for(;j<html.length;j++){if(html[j]==='{')d++;else if(html[j]==='}'&&--d===0)break}
  const c=JSON.parse(html.slice(a,j+1));const [fajr,dhuhr,asr,maghrib,isha]=c.times;
  return {fajr,chourouk:c.shuruq,dhuhr,asr,maghrib,isha,jumua1:c.jumua,jumua2:c.jumua2};
}
async function site(){
  const t=await (await fetch('https://m2m-meudon.fr/',{headers:H})).text();
  const g=l=>{const m=t.match(new RegExp(l+'[^0-9]{0,60}(\\d{2}:\\d{2})'));return m&&m[1]};
  return {fajr:g('Fajr'),chourouk:g('Chourouk'),dhuhr:g('Dhuhr'),asr:g('Asr'),maghrib:g('Maghrib'),isha:g('Isha'),jumua1:g('Joumou.{1,8}a 1'),jumua2:g('Joumou.{1,8}a 2')};
}
const ok=o=>o&&['fajr','chourouk','dhuhr','asr','maghrib','isha'].every(k=>/^\d{1,2}:\d{2}$/.test(o[k]||''));
let r=null;
try{r=await mawaqit()}catch(e){console.log('MAWAQIT :',e.message)}
if(!ok(r)){try{r=await site()}catch(e){console.log('Site :',e.message)}}
if(!ok(r)){console.log('Aucune source exploitable : horaires.json inchangé');process.exit(1)}
const now=new Date();
r.maj=now.toLocaleString('fr-FR',{timeZone:'Europe/Paris'});
r.iso=now.toLocaleDateString('sv-SE',{timeZone:'Europe/Paris'});
fs.writeFileSync('horaires.json',JSON.stringify(r));
console.log('OK',r);
