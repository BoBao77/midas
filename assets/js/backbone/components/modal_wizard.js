// Similar to Modal component in every way in all ways but two:
// 1) This modal has a next button instead of save button.
// 2) This modal has some expectations inside the modal-body form.
//    ^ More on this below
//
// This is all the component expects for it to work:
// <div class='modal-body'>
//  <section class="current">First content section</section>
//  <section>Second content section</section>
//  <section>Third content section</section>
//  <!-- and so on -->
// </div>
//
// REMEMBER: This goes inside your formTemplate.  This
// is the ModalWizardComponent, which is scoped to list controller,
// then the Form itself for the addition to the list is scoped to the
// modal-body within this modal-component template.
define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'base_view',
  'text!modal_wizard_template'
], function ($, _, Backbone, utilities, BaseView, ModalWizardTemplate) {

  Application.Component.ModalWizard = BaseView.extend({

    template: _.template(ModalWizardTemplate),

    events: {
      "click .wizard-forward" : "moveWizardForward",
      "click .wizard-backward": "moveWizardBackward",
      "click .wizard-submit"  : "submit",
      "click .wizard-cancel"  : "cancel"
    },

    initialize: function (options) {
      this.options = options;
      this.initializeListeners();
    },

    initializeListeners: function () {
      var self = this;
      if (this.model) {
        this.listenTo(this.model, this.options.modelName + ':modal:hide', function () {
          $('.modal.in').modal('hide');
        });
      }
    },

    render: function () {
      if (this.options) {
        this.data = {
          modalTitle: this.options.modalTitle
        };
      }

      var compiledTemplate = this.template(this.data);
      this.$el.html(compiledTemplate);
      return this;
    },

    /**
     * Set the child of this view, so we can remove it
     * when the view is destroyed
     * @return this for chaining
     */
    setChildView: function (view) {
      this.childView = view;
      return this;
    },

    /**
     * Set the callback on the submit button of the modal.
     * Useful for callbacks
     * @return this for chaining
     */
    setSubmit: function (fn) {
      this.childSubmit = fn;
      return this;
    },

    // In order for the ModalWizard to work it expects a section
    // by section layout inside the modal, with a 'current' class on
    // the first you want to always start on (re)render.
    moveWizardForward: function (e) {
      if (e.preventDefault) e.preventDefault();
      var self = this;

      // Store $(".current") in cache to reduce query times for DOM lookup
      // on future children and adjacent element to the current el.
      var current   = $(".current"),
          next      = current.next(),
          nextHtml  = next.html();

      var nextWizardStep = {
        exists: function () {
          return !_.isUndefined(next.next().html());
        },
        doesNotExist: function () {
          return _.isUndefined(next.next().html());
        }
      };

      hideCurrentAndInitializeNextWizardStep();
      if (nextWizardStep.doesNotExist()) {
        $("button.wizard-forward").hide();
        $("button.wizard-submit").show();
      }

      function hideCurrentAndInitializeNextWizardStep () {
        current.hide();
        current.removeClass("current");
        next.addClass("current");
        next.show();
      };
    },

    moveWizardBackward: function (e) {
      if (e.preventDefault) e.preventDefault();

      var current   = $(".current"),
          prev      = current.prev(),
          prevHtml  = prev.html();

      if (!_.isUndefined(prevHtml)) {
        current.hide();
        current.removeClass("current");
        prev.addClass("current");
        prev.show();
        $("button.wizard-forward").show();
        $("button.wizard-submit").hide();
      } else {
        return;
      }
    },

    // Dumb submit.  Everything is expected via a promise from
    // from the instantiation of this modal wizard.
    submit: function (e) {
      if (e.preventDefault) e.preventDefault();
      $('.modal.in').modal('hide');

      var d = this.options.data();
      var process = true;
      // pass the data to the view
      if (this.childSubmit) {
        // if submit returns true, continue modal processing
        process = this.childSubmit(e, d);
      }

      if (process) {
        this.collection.trigger(this.options.modelName + ":save", d);
      }
    },

    cancel: function (e) {
      if (e.preventDefault) e.preventDefault();
      $('.modal.in').modal('hide');
    },

    cleanup: function () {
      if (this.childView) { this.childView.cleanup(); }
      removeView(this);
    }
  });

  return Application.Component.ModalWizard;
})