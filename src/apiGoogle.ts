import axios from 'axios';

async function getAddress(lat: number, lon: number) {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    console.time('time');
    try {
        const response = await axios.get(url);
        const html = response.data;

        const scriptRegex = /window\.APP_INITIALIZATION_STATE\s*=\s*(\[.*?\]);/;
        const match = html.match(scriptRegex);

        if (match && match[1]) {
            const appInitializationState = JSON.parse(match[1]);
            const address = JSON.parse(
                appInitializationState[3][2].toString().replace(")]}'", ''),
            );
            // console.log(address[0][1][0][14][183][0][0][1][0]);

            console.timeEnd('time');
            return address[0][1][0][14][39];
        } else {
            console.error('Could not find APP_INITIALIZATION_STATE.');
            console.timeEnd('time');
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        console.timeEnd('time');
        return null;
    }
}

const fetch = async () => {
    const address = await getAddress(21.33319, 103.90554);
    console.log(`Địa chỉ: ${address}`);
};

fetch();
