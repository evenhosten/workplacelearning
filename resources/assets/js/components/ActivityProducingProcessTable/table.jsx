import React from "react";
import Row from "./row";
import FilterRule from "./filterRule";
import _ from "lodash";
import ProducingActivityProcessExporter from "../../services/ProducingActivityProcessExporter";

export default class ActivityProducingProcessTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activities: window.activities,
            filters: this.buildFilter(window.activities),
            exports: ["csv", "txt", "email"],
            selectedExport: "txt",
            email: "",
            emailAlert: null
        };

        this.updateFilter = this.updateFilter.bind(this);
        this.exportHandler = this.exportHandler.bind(this);
    }

    // Build filter rules from the provided activity data
    buildFilter(activities) {
        let filters = {
            duration: {rules: [], selectedRules: []},
            resourceDetail: {rules: [], selectedRules: []},
            category: {rules: [], selectedRules: []},
            difficulty: {rules: [], selectedRules: []}
        };


        // Build filters
        activities.map((activity) => {

            let duration = activity.duration;
            if (filters.duration.rules.indexOf(duration) === -1) {
                filters.duration.rules.push(duration);
            }

            let resourceDetail = activity.resourceDetail;
            if (filters.resourceDetail.rules.indexOf(resourceDetail) === -1) {
                filters.resourceDetail.rules.push(resourceDetail);
            }

            let category = activity.category;
            if (filters.category.rules.indexOf(category) === -1) {
                filters.category.rules.push(category);
            }

            let difficulty = activity.difficulty;
            if (filters.difficulty.rules.indexOf(difficulty) === -1) {
                filters.difficulty.rules.push(difficulty);
            }


        });

        filters.duration.rules.sort();
        filters.resourceDetail.rules.sort();
        filters.category.rules.sort();
        filters.difficulty.rules.sort();


        return filters;
    }

    updateFilter(type, rule) {
        // Deepclone the state
        let newFilterState = _.cloneDeep(this.state.filters);

        // Check if clicked rule is already "on"
        let index = newFilterState[type].selectedRules.indexOf(rule);
        if (index > -1) {
            // Disable rule
            newFilterState[type].selectedRules.splice(index, 1);
        } else {
            // Enable rule
            newFilterState[type].selectedRules.push(rule);
        }

        // Update state
        this.setState({filters: newFilterState});
    }

    filterActivities(activities) {

        return activities
            // Filter for Duration
            .filter((activity) => {
                if (this.state.filters.duration.selectedRules.length === 0) {
                    return true;
                }

                return this.state.filters.duration.selectedRules.indexOf(activity.duration) > -1;
            })
            // Filter for resourceDetail
            .filter((activity) => {
                if (this.state.filters.resourceDetail.selectedRules.length === 0) {
                    return true;
                }

                return this.state.filters.resourceDetail.selectedRules.indexOf(activity.resourceDetail) > -1;
            })
            // Filter for category
            .filter((activity) => {
                if (this.state.filters.category.selectedRules.length === 0) {
                    return true;
                }

                return this.state.filters.category.selectedRules.indexOf(activity.category) > -1;
            })
            // Filter for difficulty
            .filter((activity) => {
                if (this.state.filters.difficulty.selectedRules.length === 0) {
                    return true;
                }

                return this.state.filters.difficulty.selectedRules.indexOf(activity.difficulty) > -1;
            })
    }


    exportHandler() {
        const exporter = new ProducingActivityProcessExporter(this.state.selectedExport, this.filterActivities(this.state.activities));

        if(this.state.selectedExport !== 'email') {
            exporter[this.state.selectedExport]();
            exporter.download();
        } else {
            this.setState({emailAlert: undefined});
            exporter.mail(this.state.email, response => {
                if(response.hasOwnProperty("data") && response.data.status === "success") {
                    this.setState({email: "", emailAlert: true});
                } else {
                    this.setState({email: "", emailAlert: false});
                }
                setTimeout(() => this.setState({emailAlert: null}), 3000);


            });
        }
    }


    render() {
        let filteredActivities = this.filterActivities(this.state.activities);
        return <div>
            <h3 style={{cursor:"pointer"}} onClick={ () => {$('.filters').slideToggle()}}><i className="fa fa-arrow-circle-o-down" aria-hidden="true"/> Filters</h3>
            <div className="filters row" style={{display:"none"}}>
                <div className="duration col-md-3">
                    <h4>Tijd</h4>
                    <div className="buttons">
                        {this.state.filters.duration.rules.map(rule => {
                            return <FilterRule key={rule} type="duration" onClickHandler={this.updateFilter} rule={rule}
                                               activated={this.state.filters.duration.selectedRules.indexOf(rule) > -1}/>
                        })}
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

                <div className="resourceDetail col-md-3">
                    <h4>Hulpbron</h4>
                    <div className="buttons">
                        {this.state.filters.resourceDetail.rules.map(rule => {
                            return <FilterRule key={rule} type="resourceDetail" onClickHandler={this.updateFilter}
                                               rule={rule}
                                               activated={this.state.filters.resourceDetail.selectedRules.indexOf(rule) > -1}/>
                        })}
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

                <div className="duration col-md-3">
                    <h4>Categorie</h4>
                    <div className="buttons">
                        {this.state.filters.category.rules.map(rule => {
                            return <FilterRule key={rule} type="category" onClickHandler={this.updateFilter} rule={rule}
                                               activated={this.state.filters.category.selectedRules.indexOf(rule) > -1}/>
                        })}
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

                <div className="duration col-md-3">
                    <h4>Complexiteit</h4>
                    <div className="buttons">
                        {this.state.filters.difficulty.rules.map(rule => {
                            return <FilterRule key={rule} type="difficulty" onClickHandler={this.updateFilter} rule={rule}
                                               activated={this.state.filters.difficulty.selectedRules.indexOf(rule) > -1}/>
                        })}
                    </div>
                    <div style={{clear: 'both'}}/>
                </div>

            </div>
            <br/>
            <div className="export" style={{paddingBottom:"15px"}}>

                <label>Export naar&nbsp;
                    <select onChange={e => {this.setState({selectedExport: e.target.value})}} defaultValue={this.state.selectedExport}>
                        {this.state.exports.map(type => {
                            return <option key={type} value={type}>{type}</option>
                        })}
                    </select>
                </label> &nbsp;
                <button className="btn btn-info" onClick={this.exportHandler} disabled={this.state.activities.length === 0 || (this.state.selectedExport === 'email' && (!this.state.email.includes('@') || !this.state.email.includes('.')) )}>exporteer</button>
                <br/>
                {this.state.selectedExport === 'email' &&
                    <div style={{maxWidth: "400px"}}>
                        <label>Mailen naar: <input type="email" className="form-control" onChange={e => this.setState({email: e.target.value})} value={this.state.email} /></label>
                        {
                            this.state.emailAlert === undefined &&
                            <div className="alert alert-info" role="alert">Bezig met verzenden</div>
                        }
                        {
                            this.state.emailAlert === true &&
                            <div className="alert alert-success" role="alert">De email is succesvol verzonden</div>
                        }
                        {
                            this.state.emailAlert === false &&
                            <div className="alert alert-danger" role="alert">Er is iets misgegaan bij het verzenden van de email, probeer het later nog eens</div>
                        }
                    </div>
                }
            </div>

            <div className="table-responsive">
            <table className="table blockTable">
                <thead className="blue_tile">
                <tr>
                    <td></td>
                    <td>Datum</td>
                    <td>Omschrijving</td>
                    <td>Tijd</td>
                    <td>Hulpbron</td>
                    <td>Categorie</td>
                    <td>Complexiteit</td>
                    <td>Status</td>
                    <td>{/* Edit URL, no table header */}</td>
                </tr>
                </thead>
                <tbody>
                {filteredActivities.map((activity) => {
                    return <Row key={activity.id} activity={activity}/>
                })}

                </tbody>
            </table>
            </div>
        </div>
    }


}