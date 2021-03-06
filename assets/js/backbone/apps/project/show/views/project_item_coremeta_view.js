define([
  'jquery',
  'underscore',
  'async',
  'backbone',
  'utilities',
  'popovers', /* Popovers,*/
  'modal_component',
  'autocomplete',
  'text!project_item_coremeta_template'
], function ($, _, async, Backbone, utils, Popovers, ModalComponent, autocomplete, ProjectItemCoreMetaTemplate) {

  //if(_.isUndefined(popovers)){var popovers = new Popovers();}

  var ProjectItemCoreMetaView = Backbone.View.extend({

    el: "#project-coremeta-wrapper",
    model : null,

    // Set the model to null, before it is fetched from the server.
    // This allows us to clear out the previous data from the list_view,
    // and get ready for the new data for the project show view.
    // model: null,

    events: {
      "click #coremeta-save"                     : "saveCoreMeta",
      "click #coremeta-view"                     : "viewProject"
    },

    // The initialize method is mainly used for event bindings (for effeciency)
    initialize: function (options) {
      var self = this;
      this.options = options;
      this.data = options.data;
      this.action = options.action;
      this.edit = false;
      if (this.options.action) {
        if (this.options.action == 'edit') {
          this.edit = true;
        }
      }

      this.model.on("project:coremeta:show:rendered", function () {
        self.initializeToggledElements();
      });

      this.model.on("project:save:success", function (data) {
        self.render();
        $('#project-coremeta-success').show();
      });

    },

    render: function () {
      var compiledTemplate,
      data = { data: this.model.toJSON() };
      compiledTemplate = _.template(ProjectItemCoreMetaTemplate, data);
      this.$el.html(compiledTemplate);

      this.model.trigger("project:coremeta:show:rendered", data);

      return this;
    },

    initializeToggledElements: function(){
      var self = this;
      if (this.model.attributes.isOwner && this.edit){
        self.$('#project-coremeta-form').show();
        self.$('#project-coremeta-show').hide();
      }
      else{
        self.$('.coremeta-admin').hide();
      }
    },

    saveCoreMeta: function (e){
      if (e.preventDefault) e.preventDefault();
      if (!this.model.attributes.isOwner && this.edit) return false;
      var self = this;

      var pId = self.model.attributes.id;
      var title = self.$('#project-edit-form-title').val();
      var description = self.$('#project-edit-form-description').val();
      var params = { title :title, description: description };

      self.model.trigger("project:model:update", params);
    },

    viewProject: function (e) {
      if (e.preventDefault) e.preventDefault();
        Backbone.history.navigate('projects/' + this.model.attributes.id, { trigger: true });
    },

    // ---------------------
    //= Utility Methods
    // ---------------------
    cleanup: function() {
      removeView(this);
    }

  });

  return ProjectItemCoreMetaView;
});