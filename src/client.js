import Promise  from 'bluebird';
import Travis   from 'travis-ci';
import _        from 'lodash';
import chalk    from 'chalk';
import config   from './config';
import CircleCI from 'circleci';

/**
 * @param {Mozaik} mozaik
 * @returns {Function}
 */
const client = mozaik => {
    mozaik.loadApiConfig(config);

    const travis = new Travis({
        version: '2.0.0',
        pro: true,
    });
    const circleci = new CircleCI({
        auth: config.get('circleci.token')
    });

    // make auth promise
    const authPromise = new Promise((resolve, reject) => {
        const token = config.get('github.token');
        if (token === undefined) {
            reject('Missing env variable: GITHUB_TOKEN');
        }

        travis.authenticate({
            github_token: token
        }, (err) => {
            if (err) reject(`Authentication failed ${JSON.stringify(err)}`);
            else resolve(true);
        });
    });

    return {
        /**
         * Fetch repository info.
         *
         * @param {object} params
         * @param {string} params.owner
         * @param {string} params.repository
         * @returns {Promise}
         */
        repository({ owner, repository }) {
            const def = Promise.defer();

            mozaik.logger.info(chalk.yellow(`[travis] calling repository: ${owner}/${repository}`));

            travis.repos(owner, repository).get((err, res) => {
                if (err) {
                    def.reject(err);
                }

                def.resolve(res.repo);
            });

            return def.promise;
        },
        
        circleciRecent() {
            const def = Promise.defer();
            mozaik.logger.info(chalk.yellow(`[travis] calling Circle-CI repo!`));

            circleci.getRecentBuilds({ limit: 20 })
                .then((builds) => {
                    mozaik.logger.info(chalk.yellow(`[travis] Circle-CI success! ${JSON.stringify(builds)} ${JSON.stringify(arguments)}`));
                    def.resolve(builds);
                })
                .catch((err) => {
                    mozaik.logger.info(chalk.yellow(`[travis] Circle-CI fail! ${JSON.stringify(err)} ${JSON.stringify(arguments)}`));
                    def.reject(err);
                });

            return def.promise;
        },


        buildHistoryRecent({ owner, repositories }) {
            const promises = _.map(repositories, (r) => {
                return new Promise((resolve, reject) => {
                    travis.repos(owner, r).builds.get((err, res) => {
                        if (res === undefined) reject(err);
                        else {
                            res.builds.forEach(build => {
                                const commit = _.find(res.commits, { id: build.commit_id });
                                if (commit) {
                                    build.commit = commit;
                                }
                                build.reponame = r;
                            });

                            resolve(res.builds);
                        }
                    });
                });
            });

            let def = Promise.defer();

            authPromise.then(() => {
                Promise.all(promises).then((repoBuilds) => {
                    const sortedBuildList = _(repoBuilds)
                    .flatten()
                    .sortBy('finished_at')
                    .reverse()
                    .value();

                    def.resolve(sortedBuildList);
                });
            });

            return def.promise;
        },

        /**
         * Fetch repository build history.
         *
         * @param {object} params
         * @param {string} params.owner
         * @param {string} params.repository
         * @returns {Promise}
         */
        buildHistory({ owner, repository }) {
            const def = Promise.defer();

            mozaik.logger.info(chalk.yellow(`[travis] calling buildHistory: ${owner}/${repository}`));

            travis.repos(owner, repository).builds.get((err, res) => {
                if (err) {
                    def.reject(err);
                }

                res.builds.forEach(build => {
                    const commit = _.find(res.commits, { id: build.commit_id });
                    if (commit) {
                        build.commit = commit;
                    }
                });

                def.resolve(res.builds);
            });

            return def.promise;
        },
    };
};


export default client;
