import React, { Component, PropTypes } from 'react';
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import BuildHistoryItem                from './BuildHistoryItem.jsx';
import Mozaik                          from 'mozaik/browser';


class circlecirecent extends Component {
    constructor(props) {
        super(props);

        this.state = { builds: [] };
    }

    getApiRequest() {
        // const { owner, repository } = this.props;

        return {
            id:     `travis.circleciRecent`,
        };
    }

    onApiData(builds) {
        this.setState({ builds });
    }

    render() {
        // const { owner, repository } = this.props;
        let { builds }            = this.state;

        const circleStateMapper = (circleState) => {
            if (circleState == 'running') return 'started';
            else if (circleState == 'success' || circleState == 'fixed') return 'passed';
            else return circleState;
        };

        builds = builds.map((build) => {
            return {
                number: build.build_num,
                state: circleStateMapper(build.status),
                finished_at: build.stop_time,
                commit: {
                    message: build.all_commit_details[0].subject
                },
                reponame: build.reponame,
            };
        });

        const buildNodes = builds.map(build => (
            <BuildHistoryItem key={build.id} build={build} />
        ));

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">CircleCI build history</span>
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {buildNodes}
                </div>
            </div>
        );
    }
}

circlecirecent.displayName = 'circlecirecent';

// circlecirecent.propTypes = {
//     owner:      React.PropTypes.string.isRequired,
//     repository: React.PropTypes.string.isRequired
// };

reactMixin(circlecirecent.prototype, ListenerMixin);
reactMixin(circlecirecent.prototype, Mozaik.Mixin.ApiConsumer);


export default circlecirecent;
