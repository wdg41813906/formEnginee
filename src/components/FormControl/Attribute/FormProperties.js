import React from "react";
import InvisibleTxtInit from "./InvisibleTxtInit";
import FormSubmitVerification from "./FormSubmitVerification";
import FormLayout from "./FormLayout";
import BorderShow from "./BorderShow";
import FormControlStyleModel from "./FormControlStyleModel";
import BusinessLoader from "./BusinessLoader";
import FormRelation from "./FormRelation";
import FormButton from "./FormButton";
import PrintConfig from "./PrintConfig";

class FormProperties extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.currentIndex === -1;
    }
    
    render() {
        let { formProperties, setFormProperties, currentFormData, buildFormDataFilter, allWithValideList, getBusinessPosition } = this.props;
        
        let {
            invisibleTxtInit,
            formSubmitVerification,
            formSubmitVerificationMsg,
            formLayout,
            border,
            Print,
            formControlStyleModel,
            thirdPartyId,
            thirdPartyVerification,
            bussinessComSetting,
            tableLinker
        } = formProperties.toJS();
        
        return (
            <React.Fragment>
                <FormLayout
                    value={formLayout}
                    onChange={ele => {
                        setFormProperties({ formLayout: ele });
                        // formControlStyleModel: ele === 1 ? 2 : 1
                    }}
                />
                <FormControlStyleModel value={formControlStyleModel}
                                       onChange={ele => setFormProperties({ formControlStyleModel: ele })}/>
                <BorderShow.Component value={border} onChange={ele => setFormProperties({ border: ele })}/>
                <InvisibleTxtInit value={invisibleTxtInit}
                                  onChange={ele => setFormProperties({ invisibleTxtInit: ele })}/>
                <FormSubmitVerification.Component
                    {...FormSubmitVerification.getProps(this.props)}
                    value={formSubmitVerification}
                    formSubmitVerificationMsg={formSubmitVerificationMsg}
                    onChange={ele => setFormProperties({ formSubmitVerification: ele })}
                    setFormProperties={setFormProperties}
                    thirdPartyId={thirdPartyId}
                    thirdPartyVerification={thirdPartyVerification}
                    currentFormData={currentFormData}
                    buildFormDataFilter={buildFormDataFilter}
                    allWithValideList={allWithValideList}
                />
                <BusinessLoader.Component getBusinessPosition={getBusinessPosition}
                                          bussinessComSetting={bussinessComSetting || {}}
                                          onChange={setFormProperties} {...BusinessLoader.getProps(this.props)} />
                <FormRelation.Component {...FormRelation.getProps(this.props)} tableLinker={tableLinker}
                                        onChange={ele => setFormProperties({ tableLinker: ele })}/>
                <FormButton.Component {...FormButton.getProps(this.props)}/>
                <PrintConfig.Component value={Print} onChange={ele => setFormProperties({ Print: ele })}/>
            </React.Fragment>
        );
    }
}

export default FormProperties;
