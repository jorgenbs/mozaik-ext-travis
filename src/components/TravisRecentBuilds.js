import React, { Component, PropTypes } from 'react';
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import BuildHistoryItem                from './BuildHistoryItem.jsx';
import Mozaik                          from 'mozaik/browser';


class TravisRecentBuilds extends Component {
    constructor(props) {
        super(props);

        this.state = { builds: [] };
    }

    getApiRequest() {
        const { owner, repositories } = this.props;

        return {
            id:     `travis.buildHistoryRecent.${owner}.${repositories}`,
            params: { owner, repositories }
        };
    }

    onApiData(builds) {
        this.setState({ builds });
    }

    render() {
        const { owner, repositories } = this.props;
        const { builds }            = this.state;

        const buildNodes = builds.map(build => (
            <BuildHistoryItem key={build.id} build={build} />
        ));

        return (
            <div>
                <div className="widget__header">
                    <span className="widget__header__subject">TravisCI</span> build history
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {buildNodes}
                </div>
            </div>
        );
    }
}

TravisRecentBuilds.displayName = 'TravisRecentBuilds';

TravisRecentBuilds.propTypes = {
    owner:      React.PropTypes.string.isRequired,
    repositories: React.PropTypes.array.isRequired
};

reactMixin(TravisRecentBuilds.prototype, ListenerMixin);
reactMixin(TravisRecentBuilds.prototype, Mozaik.Mixin.ApiConsumer);


export default TravisRecentBuilds;
