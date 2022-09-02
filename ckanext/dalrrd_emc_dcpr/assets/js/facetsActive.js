"use strict";


ckan.module('emc-facets-active', function (jQuery, _) {


    return {
        initialize: function () {

            const filters = {
                'organization': 'Organizations',
                '_organization_limit': 'Organizations',
                'vocab_sasdi_themes': 'SASDIThemes',
                '_vocab_sasdi_themes_limit': 'SASDIThemes',
                'vocab_iso_topic_categories': 'ISOTopicCategories',
                '_vocab_iso_topic_categories_limit': 'ISOTopicCategories',
                'tags': 'Tags',
                '_tags_limit': 'Tags'
            };
            const keys = Object.keys(filters);

            for(let i=0; i<keys.length; i++){
                if(getUrlParameter(keys[i])){
                    document.getElementById(filters[keys[i]]).classList.add("in")
                    const link = "a[href='#"+filters[keys[i]]+"']";
                    const a = document.querySelectorAll(link);
                    a[0].setAttribute('aria-expanded', 'true')

                }
                const head = document.getElementById('head' + filters[keys[i]]);
                const title = head.querySelector('.panel-title');
                const link = title.querySelector('.panel-title-link');
                if(link.getAttribute('aria-expanded')==true){
                    alert(head);
                }
       }
        }
    }

})


ckan.module("xml_parser",function($){
    /*
        this isn't completed yet, the idea is to show
        a flash message when the xml file is incorrect.

    */
    return{
        initialize: function(){
            $.proxyAll(this,/_on/);
            this.el.on("change", this._onChange)
        },
        _handleError:function(response) {
            if (!response.ok) {
                return response.text().then(txt => {throw new Error(txt)})
            }
            return response;
        } ,
        _onChange:function(e){
            let the_input = document.getElementById('upload_input')
            let _files = the_input.files
            let formData = new FormData();
            for(let _file of _files){
                formData.append("xml_dataset_files",_file)
            }

            let flash_box = document.getElementsByClassName("flash-messages")[0]

            let msg_box_creation = function(class_list, msg){
                // DRY
                let info_or_err = document.createElement("div")
                let close_btn = document.createElement("a")
                close_btn.classList.add("close")
                close_btn.setAttribute("href","#")
                close_btn.innerHTML = "×"
                info_or_err.classList.add(...class_list)
                info_or_err.innerHTML = msg
                info_or_err.append(close_btn)
                flash_box.append(info_or_err)
            }

            fetch(window.location.href.split('?')[0]+'xml_parser/',{method:"POST", body:formData}).
            then(res => this._handleError(res)).
            then(res=>res.json()).then(
                (data)=>{
                    console.log(data)
                    let err_msgs = data.response.err_msgs
                    let info_msgs = data.response.info_msgs
                    console.log("error messages:", err_msgs)
                    if(err_msgs == undefined && info_msgs == undefined){
                        if(data.response.includes("all packages were created")){
                            // the cause where everything went right
                            // sessionStorage.setItem("reloading", "true");
                            // document.location.reload();
                            // //window.location.reload()
                            // window.addEventListener("load", function(){
                            //     var reloading = sessionStorage.getItem("reloading");
                            //     if (reloading) {
                            //         sessionStorage.removeItem("reloading");
                            //         msg_box_creation(["alert","fade-in","alert-info"], data.response)
                            //     }

                            // })
                            msg_box_creation(["alert","fade-in","alert-info"], data.response)
                        }
                    }
                    else {
                        for(let err of err_msgs){
                            msg_box_creation(["warning-explanation","alert","alert-danger"], err)
                        }
                        for(let info of info_msgs){
                            msg_box_creation(["alert","fade-in","alert-info"], info)
                        }
                    }

                    flash_box.style.display = "block"
                    // window.location.reload()
                }
                ).catch(err=>{
                    msg_box_creation(["warning-explanation","alert","alert-danger"], err)
                    flash_box.style.display = "block"
                    console.log(err)
                })
        }
    }
})

ckan.module("emc-filter-expand", function ($){
    return {
        initialize: function(){

            $.proxyAll(this,/_on/);
            this.el.on('click', this._onClick);

        },

        _onClick: function (event) {
            const parents = event.target.parentNode.parentNode.parentNode;
            const expand = event.target.getAttribute('aria-expanded');
            const classes = parents.classList
            if(parents.classList.contains('expanded')){
                parents.classList.remove('expanded');
            }
            else {
                parents.classList.add('expanded')
            }
        }
    }


})



ckan.module("repeating_tags_handler", function ($){
    /*
        control muliple interaction regarding the tags
        section, handles both css and buttons behavior.
    */
    return {
        initialize: function(){
            $.proxyAll(this,/_on/);
            // set the styles before copying the section
            let add_btns = $(".add_metadata_tags_btn")
            add_btns.each((idx,add_btn) => {add_btn.style.marginRight="2px"})
            $(document).on('click','.add_metadata_tags_btn',this._on_add_tags)
            $(document).on('click','.remove_metadata_tags_btn',this._on_remove_tags)
            let repeating_fields_wrapper = $(".repeating_custom_tag_row-index-0")
            repeating_fields_wrapper.css({"margin-bottom":"30px"})
            let tags_holder = $(".metadata_tags_holder")
            tags_holder.css("width:100%")
            $(".metadata_tags_styler").css({"width":"100%", "display": 'flex', 'flex-direction': 'row'})
            $(".metadata_tags_input").css({"width":"40%"})
            $(".metadata_tags_type_select").css({"width":"30%"})//tag_select
            $("#tag_select").css({"width":"100%", "height":"34px", "margin-left":"4px"})
            $(".tags_buttons_wrapper").css({"margin-left": "4px", "padding-top": "2px"})
            $(".tags_handling_buttons").css({"width":"100%","padding-top":"22px", "display": "flex", "flex-direction": "row", "margin-left":"4px"})
            this.section_html = tags_holder.html()
            const config = { attributes: true, childList: true, subtree: true };
            //const added_items_observer = new MutationObserver(this.added_items_mutation_observer);
            //added_items_observer.observe(repeating_fields_wrapper.get(0), config)
        },

        _on_add_tags:function(e){
            e.preventDefault()
            //let search_parent = e.target.parentElement.parentElement.parentElement.parentElement
            let search_parent = e.target.closest(".metadata_tags_styler")
            let new_index = Array.from(search_parent.parentNode.children).indexOf(search_parent) +1
            let new_index_text = `index-${new_index}`
            this.section_html = this.section_html.replace(/index-[0-9]/g, new_index_text)
            this.el.append(this.section_html)
        },

        _on_remove_tags:function(e){
            e.preventDefault()
            let removed_tag_row = e.target.closest(".metadata_tags_styler")
            //let removed_tag_row = e.target.parentElement.parentElement.parentElement.parentElement
            removed_tag_row.remove()
        },

        // keeping this as mutation maybe needed in future.
        // added_items_mutation_observer:function(mutationList, observer){
        //     for (const mutation of mutationList) {
        //         if (mutation.type === 'childList') {
        //         //   if(mutation.addNodes.length>0 && mutation.removedNodes.length==0){
        //         //     // a new item added

        //         //   }
        //         }
        //     }
        // },
    }


})
