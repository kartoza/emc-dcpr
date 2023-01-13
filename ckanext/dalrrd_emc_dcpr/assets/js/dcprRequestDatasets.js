"use strict";

ckan.module('dcprRequestDatasets', function(jQuery, _){
    return {

        options: {
            render_remove_button: true
        },

        _renderedTemplateReceived: false,

        initialize: function() {
            jQuery.proxyAll(this, /_on/);
            this.el.on('click', this._onAddDatasetFieldset)


            //get url
            let url = window.location.href
            let custodianCheckbox = document.getElementsByName("dataset_custodian")
            console.log(url)
            if(url.includes("e1")){
                for (let check of custodianCheckbox){
                    check.checked = true
                    check.value = true
                }
            }
        },

        _onAddDatasetFieldset: function () {
            let numExisting = this._getNumDatasetFieldsets()
            this.options.index = numExisting + 1
            this.options.lenght = numExisting + 1
            if (!this._renderedTemplateReceived) {
                this.sandbox.client.getTemplate(
                    'dcpr_request_dataset_form_fieldset.html',
                    this.options,
                    this._onReceiveRenderedTemplate,
                )
                this._renderedTemplateReceived = true
            }
        },

        _onReceiveRenderedTemplate: function (renderedHtml) {
            let parent = document.querySelector('#insert-dataset-fieldset-button')
            parent.insertAdjacentHTML('beforebegin', renderedHtml)
            this._renderedTemplateReceived = false
            let removeButtonEl = document.querySelector('#remove-previous-dataset-button')
            removeButtonEl.removeAttribute('disabled')
        },

        _onRemoveDatasetFieldset: function (event) {
            let fieldsetSelector = '.dynamic-dataset-fieldset'
            let datasetFieldsets = document.querySelectorAll(fieldsetSelector)
            let indexToRemove = datasetFieldsets.length
            console.log(`Was asked to remove previous dataset, which has index ${indexToRemove}`)
            let lastDatasetFieldset = datasetFieldsets[datasetFieldsets.length]
            lastDatasetFieldset.remove()
            if (document.querySelectorAll(fieldsetSelector).length < 2) {
                let removeButton = document.querySelector('#remove-previous-dataset-button')
                removeButton.setAttribute('disabled', true)
            }
        },

        _getNumDatasetFieldsets: function () {
            let parent = document.querySelector('fieldset#dcpr-request-owner-fields')
            return parent.querySelectorAll('fieldset').length
        },
    }
})
