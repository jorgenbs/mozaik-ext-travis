import convict from 'convict';


const config = convict({
    travis: {
        token: {
            doc:     'The github API token.',
            default: '',
            format:  String,
            env:     'GITHUB_API_TOKEN'
        }
    }
});


export default config;