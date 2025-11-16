/**
 * Store prompt into a clipboard for werkWorden.
 */
const text = document.getElementById('werkwoorden');
const result = document.getElementById('store_werkwoorden_result');
async function werkwoordenPrompt() {
    const prompt = `Maak een tabel in het Nederlands met de volgende kolommen:
- infinitief werkwoord
- enkelvoud werkwoord in verleende tijd
- meervoud werkwoord in verleende tijd
- werkwoord in voltooide tijd
- uitleg van het werkwoord op niveau A2 in het Nederlands
- uitleg van het werkwoord in het Rus
- voorbeeldzin met het werkwoord in tegenwoordige tijd op niveau A2
- voorbeeldzin met het werkwoord in verleende tijd op niveau A2 
- voorbeeldzin met het werkwoord in voltooide op niveau A2
- gebruikt werkwoord met hebben: Ja of Nee
- gebruikt werkwoord met zijn: Ja of Nee
van de volgende werkwoorden in het Nederlands:

${text?.value}`;
    await navigator.clipboard.writeText(prompt);
    result.innerText = 'OK';
    setTimeout(() => result.innerText = '', 2000);
}
document.getElementById('werkwoorden_prompt').onclick = werkwoordenPrompt;
export {};
