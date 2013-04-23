// Generated by CoffeeScript 1.3.3
(function() {

  define(['exports', 'underscore', 'backbone', 'marionette', 'jquery', 'aloha', 'moment', 'bookish/controller', 'bookish/models', 'bookish/media-types', './languages', 'hbs!bookish/views/content-edit', 'hbs!bookish/views/search-box', 'hbs!bookish/views/search-results', 'hbs!bookish/views/search-results-item', 'hbs!bookish/views/dnd-handle', 'hbs!bookish/views/modal-wrapper', 'hbs!bookish/views/edit-metadata', 'hbs!bookish/views/edit-roles', 'hbs!bookish/views/language-variants', 'hbs!bookish/views/aloha-toolbar', 'hbs!bookish/views/sign-in-out', 'hbs!bookish/views/add', 'hbs!bookish/views/add-item', 'hbs!bookish/views/book-edit', 'hbs!bookish/views/book-edit-node', 'i18n!bookish/nls/strings', 'bootstrap', 'select2', 'css!font-awesome', 'less!bookish'], function(exports, _, Backbone, Marionette, jQuery, Aloha, Moment, Controller, Models, MEDIA_TYPES, Languages, CONTENT_EDIT, SEARCH_BOX, SEARCH_RESULT, SEARCH_RESULT_ITEM, DND_HANDLE, DIALOG_WRAPPER, EDIT_METADATA, EDIT_ROLES, LANGUAGE_VARIANTS, ALOHA_TOOLBAR, SIGN_IN_OUT, ADD_VIEW, ADD_ITEM_VIEW, BOOK_EDIT, BOOK_EDIT_NODE, __) {
    var AddItemView, BookEditNodeView, DELAY_BEFORE_SAVING, LANGUAGES, METADATA_SUBJECTS, SELECT2_AJAX_HANDLER, SELECT2_MAKE_SORTABLE, languageCode, updateTimes, value, _EnableContentDragging, _ref;
    _EnableContentDragging = function(model, $el) {
      $el.data('editor-model', model);
      return $el.draggable({
        addClasses: false,
        revert: 'invalid',
        appendTo: 'body',
        cursorAt: {
          top: 0,
          left: 0
        },
        helper: function(evt) {
          var $handle, mediaType, shortTitle, title;
          title = model.get('title') || model.dereference().get('title') || '';
          shortTitle = title;
          if (title.length > 20) {
            shortTitle = title.substring(0, 20) + '...';
          }
          mediaType = model.dereference().mediaType;
          $handle = jQuery(DND_HANDLE({
            id: model.id,
            mediaType: mediaType,
            title: title,
            shortTitle: shortTitle
          }));
          return $handle;
        }
      });
    };
    DELAY_BEFORE_SAVING = 3000;
    updateTimes = function($times) {
      var _this = this;
      return $times.each(function(i, el) {
        var $el, updateTime;
        $el = jQuery(el);
        updateTime = function() {
          var diff, nextUpdate, now, utc, utcTime;
          if ($el.parents('html')[0]) {
            utc = $el.attr('datetime');
            if (utc) {
              utcTime = Moment.utc(utc);
              now = Moment();
              diff = now.diff(utcTime) / 1000;
              if (diff < 0) {
                utcTime = now;
              }
              $el.text(utcTime.fromNow());
              nextUpdate = 10;
              if (diff < 60) {
                nextUpdate = 5;
              } else if (diff < 60 * 60) {
                nextUpdate = 30;
              } else {
                nextUpdate = 60 * 2;
              }
              return setTimeout(updateTime, nextUpdate * 1000);
            }
          }
        };
        return updateTime();
      });
    };
    SELECT2_AJAX_HANDLER = function(url) {
      return {
        quietMillis: 500,
        url: url,
        dataType: 'json',
        data: function(term, page) {
          return {
            q: term
          };
        },
        results: function(data, page) {
          var id;
          return {
            results: (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = data.length; _i < _len; _i++) {
                id = data[_i];
                _results.push({
                  id: id,
                  text: id
                });
              }
              return _results;
            })()
          };
        }
      };
    };
    SELECT2_MAKE_SORTABLE = function($el) {
      return Aloha.ready(function() {
        return $el.select2('container').find('ul.select2-choices').sortable({
          cursor: 'move',
          containment: 'parent',
          start: function() {
            return $el.select2('onSortStart');
          },
          update: function() {
            return $el.select2('onSortEnd');
          }
        });
      });
    };
    METADATA_SUBJECTS = ['Arts', 'Mathematics and Statistics', 'Business', 'Science and Technology', 'Humanities', 'Social Sciences'];
    LANGUAGES = [
      {
        code: '',
        "native": '',
        english: ''
      }
    ];
    _ref = Languages.getLanguages();
    for (languageCode in _ref) {
      value = _ref[languageCode];
      value = jQuery.extend({}, value);
      jQuery.extend(value, {
        code: languageCode
      });
      LANGUAGES.push(value);
    }
    exports.SearchResultsItemView = Marionette.ItemView.extend({
      tagName: 'tr',
      template: SEARCH_RESULT_ITEM,
      initialize: function() {
        var _this = this;
        return this.listenTo(this.model, 'change', function() {
          return _this.render();
        });
      },
      onRender: function() {
        var $content, $times,
          _this = this;
        $times = this.$el.find('time[datetime]');
        updateTimes($times);
        this.$el.on('click', function() {
          return Controller.editModel(_this.model);
        });
        $content = this.$el.children('*[data-media-type]');
        return Aloha.ready(function() {
          _EnableContentDragging(_this.model, $content);
          return $content.each(function(i, el) {
            var $el, ModelType, validSelectors;
            $el = jQuery(el);
            ModelType = MEDIA_TYPES.get(_this.model.mediaType);
            validSelectors = _.map(ModelType.prototype.accepts(), function(mediaType) {
              return "*[data-media-type=\"" + mediaType + "\"]";
            });
            validSelectors = validSelectors.join(',');
            if (validSelectors) {
              return $el.droppable({
                greedy: true,
                addClasses: false,
                accept: validSelectors,
                activeClass: 'editor-drop-zone-active',
                hoverClass: 'editor-drop-zone-hover',
                drop: function(evt, ui) {
                  var $drag, $drop, delay, drop, model;
                  $drag = ui.draggable;
                  $drop = jQuery(evt.target);
                  model = $drag.data('editor-model');
                  drop = $drop.data('editor-model');
                  if (drop.accepts().indexOf(model.mediaType) < 0) {
                    model = model.dereference();
                  }
                  if (drop.accepts().indexOf(model.mediaType) < 0) {
                    throw 'INVALID_DROP_MEDIA_TYPE';
                  }
                  delay = function() {
                    return drop.addChild(model);
                  };
                  return setTimeout(delay, 10);
                }
              });
            }
          });
        });
      }
    });
    exports.SearchResultsView = Marionette.CompositeView.extend({
      template: SEARCH_RESULT,
      itemViewContainer: 'tbody',
      itemView: exports.SearchResultsItemView
    });
    exports.SearchBoxView = Marionette.ItemView.extend({
      template: SEARCH_BOX,
      events: {
        'keyup #search': 'setFilter',
        'change #search': 'setFilter'
      },
      initialize: function() {
        if (!this.model.setFilter) {
          throw 'BUG: You must wrap the collection in a FilterableCollection';
        }
      },
      setFilter: function(evt) {
        var $searchBox, filterStr;
        $searchBox = jQuery(this.$el).find('#search');
        filterStr = $searchBox.val();
        if (filterStr.length < 2) {
          filterStr = '';
        }
        return this.model.setFilter(filterStr);
      }
    });
    exports.AlohaEditView = Marionette.ItemView.extend({
      template: function() {
        throw 'You need to specify a template, modelKey, and optionally alohaOptions';
      },
      modelKey: null,
      alohaOptions: null,
      initialize: function() {
        var _this = this;
        this.listenTo(this.model, 'change:_done', function(model, value, options) {
          return _this.render();
        });
        return this.listenTo(this.model, "change:" + this.modelKey, function(model, value, options) {
          var alohaEditable, alohaId, editableBody;
          if (options.internalAlohaUpdate) {
            return;
          }
          alohaId = _this.$el.attr('id');
          if (alohaId && _this.$el.parents()[0]) {
            alohaEditable = Aloha.getEditableById(alohaId);
            editableBody = alohaEditable.getContents();
            if (value !== editableBody) {
              return alohaEditable.setContents(value);
            }
          } else {
            return _this.$el.empty().append(value);
          }
        });
      },
      onRender: function() {
        var updateModelAndSave,
          _this = this;
        if (typeof MathJax !== "undefined" && MathJax !== null) {
          MathJax.Hub.Configured();
        }
        if (this.model.get('_done')) {
          this.$el.addClass('disabled');
          Aloha.ready(function() {
            _this.$el.aloha(_this.alohaOptions);
            return _this.$el.removeClass('disabled');
          });
          updateModelAndSave = function() {
            var alohaEditable, alohaId, editableBody;
            alohaId = _this.$el.attr('id');
            if (alohaId) {
              alohaEditable = Aloha.getEditableById(alohaId);
              editableBody = alohaEditable.getContents();
              return _this.model.set(_this.modelKey, editableBody, {
                internalAlohaUpdate: true
              });
            }
          };
          return this.$el.on('blur', updateModelAndSave);
        }
      }
    });
    exports.ContentEditView = exports.AlohaEditView.extend({
      template: CONTENT_EDIT,
      modelKey: 'body'
    });
    exports.TitleEditView = exports.AlohaEditView.extend({
      template: function(serialized_model) {
        return "" + (serialized_model.title || 'Untitled');
      },
      modelKey: 'title',
      tagName: 'span'
    });
    exports.ContentToolbarView = Marionette.ItemView.extend({
      template: ALOHA_TOOLBAR,
      onRender: function() {
        var _this = this;
        this.$el.addClass('disabled');
        return Aloha.ready(function() {
          return _this.$el.removeClass('disabled');
        });
      }
    });
    exports.MetadataEditView = Marionette.ItemView.extend({
      template: EDIT_METADATA,
      events: {
        'change *[name=language]': '_updateLanguageVariant'
      },
      initialize: function() {
        var _this = this;
        this.listenTo(this.model, 'change:language', function() {
          return _this._updateLanguage();
        });
        this.listenTo(this.model, 'change:subjects', function() {
          return _this._updateSubjects();
        });
        return this.listenTo(this.model, 'change:keywords', function() {
          return _this._updateKeywords();
        });
      },
      _updateLanguage: function() {
        var lang, language;
        language = this.model.get('language') || '';
        lang = language.split('-')[0];
        this.$el.find("*[name=language]").select2('val', lang);
        return this._updateLanguageVariant();
      },
      _updateLanguageVariant: function() {
        var $label, $language, $variant, code, lang, language, variant, variants, _ref1, _ref2;
        $language = this.$el.find('*[name=language]');
        language = this.model.get('language') || '';
        _ref1 = language.split('-'), lang = _ref1[0], variant = _ref1[1];
        if ($language.val() !== lang) {
          lang = $language.val();
          variant = null;
        }
        $variant = this.$el.find('*[name=variantLanguage]');
        $label = this.$el.find('*[for=variantLanguage]');
        variants = [];
        _ref2 = Languages.getCombined();
        for (code in _ref2) {
          value = _ref2[code];
          if (code.slice(0, 2) === lang) {
            jQuery.extend(value, {
              code: code
            });
            variants.push(value);
          }
        }
        if (variants.length > 0) {
          $variant.removeAttr('disabled');
          $variant.html(LANGUAGE_VARIANTS({
            'variants': variants
          }));
          $variant.find("option[value=" + language + "]").attr('selected', true);
          $label.removeClass('hidden');
          return $variant.removeClass('hidden');
        } else {
          $variant.empty().attr('disabled', true);
          $variant.addClass('hidden');
          return $label.addClass('hidden');
        }
      },
      _updateSelect2: function(key) {
        return this.$el.find("*[name=" + key + "]").select2('val', this.model.get(key));
      },
      _updateSubjects: function() {
        return this._updateSelect2('subjects');
      },
      _updateKeywords: function() {
        return this._updateSelect2('keywords');
      },
      onRender: function() {
        var $keywords, $lang, $languages, $subjects, lang, _i, _len;
        $languages = this.$el.find('*[name=language]');
        for (_i = 0, _len = LANGUAGES.length; _i < _len; _i++) {
          lang = LANGUAGES[_i];
          $lang = jQuery('<option></option>').attr('value', lang.code).text(lang["native"]);
          $languages.append($lang);
        }
        $languages.select2({
          placeholder: __('Select a language')
        });
        $subjects = this.$el.find('*[name=subjects]');
        $subjects.select2({
          tags: METADATA_SUBJECTS,
          tokenSeparators: [','],
          separator: '|'
        });
        $keywords = this.$el.find('*[name=keywords]');
        $keywords.select2({
          tags: this.model.get('keywords') || [],
          tokenSeparators: [','],
          separator: '|',
          initSelection: function(element, callback) {
            var data;
            data = [];
            _.each(element.val().split('|'), function(str) {
              return data.push({
                id: str,
                text: str
              });
            });
            return callback(data);
          }
        });
        this._updateLanguage();
        this._updateSubjects();
        this._updateKeywords();
        return this.delegateEvents();
      },
      attrsToSave: function() {
        var keywords, kw, language, subjects, variant;
        language = this.$el.find('*[name=language]').val();
        variant = this.$el.find('*[name=variantLanguage]').val();
        language = variant || language;
        subjects = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=subjects]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        if ('' === subjects[0]) {
          subjects = [];
        }
        keywords = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=keywords]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        if ('' === keywords[0]) {
          keywords = [];
        }
        return {
          language: language,
          subjects: subjects,
          keywords: keywords
        };
      }
    });
    exports.RolesEditView = Marionette.ItemView.extend({
      template: EDIT_ROLES,
      onRender: function() {
        var $authors, $copyrightHolders;
        $authors = this.$el.find('*[name=authors]');
        $copyrightHolders = this.$el.find('*[name=copyrightHolders]');
        $authors.select2({
          tags: this.model.get('authors') || [],
          tokenSeparators: [','],
          separator: '|'
        });
        $copyrightHolders.select2({
          tags: this.model.get('copyrightHolders') || [],
          tokenSeparators: [','],
          separator: '|'
        });
        SELECT2_MAKE_SORTABLE($authors);
        SELECT2_MAKE_SORTABLE($copyrightHolders);
        this._updateAuthors();
        this._updateCopyrightHolders();
        return this.delegateEvents();
      },
      _updateAuthors: function() {
        return this.$el.find('*[name=authors]').select2('val', this.model.get('authors') || []);
      },
      _updateCopyrightHolders: function() {
        return this.$el.find('*[name=copyrightHolders]').select2('val', this.model.get('copyrightHolders') || []);
      },
      attrsToSave: function() {
        var authors, copyrightHolders, kw;
        authors = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=authors]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        copyrightHolders = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = this.$el.find('*[name=copyrightHolders]').val().split('|');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            kw = _ref1[_i];
            _results.push(kw);
          }
          return _results;
        }).call(this);
        return {
          authors: authors,
          copyrightHolders: copyrightHolders
        };
      }
    });
    exports.DialogWrapper = Marionette.ItemView.extend({
      template: DIALOG_WRAPPER,
      onRender: function() {
        var _this = this;
        this.options.view.render();
        this.$el.find('.dialog-body').append(this.options.view.$el);
        this.$el.on('click', '.cancel', function() {
          return _this.trigger('cancelled');
        });
        return this.$el.on('click', '.save', function(evt) {
          var attrs;
          evt.preventDefault();
          attrs = _this.options.view.attrsToSave();
          return _this.options.view.model.save(attrs, {
            success: function(res) {
              _this.options.view.model.trigger('sync');
              return _this.trigger('saved');
            },
            error: function(res) {
              return alert('Something went wrong when saving: ' + res);
            }
          });
        });
      }
    });
    exports.AuthView = Marionette.ItemView.extend({
      template: SIGN_IN_OUT,
      events: {
        'click #sign-in': 'signIn',
        'click #sign-out': 'signOut',
        'click #save-content': 'saveContent'
      },
      initialize: function() {
        var beforeUnload,
          _this = this;
        this.dirtyModels = new Backbone.Collection();
        this.dirtyModels.comparator = 'id';
        beforeUnload = function() {
          if (_this.hasChanged) {
            return 'You have unsaved changes. Are you sure you want to leave this page?';
          }
        };
        jQuery(window).on('beforeunload', beforeUnload);
        this.listenTo(this.model, 'change', function() {
          return _this.render();
        });
        this.listenTo(this.model, 'change:userid', function() {
          return _this.render();
        });
        this.listenTo(Models.ALL_CONTENT, 'change:_isDirty', function(model, b, c) {
          if (model.get('_isDirty')) {
            return _this.dirtyModels.add(model);
          } else {
            return _this.dirtyModels.remove(model);
          }
        });
        this.listenTo(Models.ALL_CONTENT, 'change:treeNode add:treeNode remove:treeNode', function(model, b, c) {
          return _this.dirtyModels.add(model);
        });
        this.listenTo(Models.ALL_CONTENT, 'add', function(model) {
          if (model.get('_isDirty')) {
            return _this.dirtyModels.add(model);
          }
        });
        this.listenTo(this.dirtyModels, 'add reset', function(model, b, c) {
          var $save;
          _this.hasChanged = true;
          $save = _this.$el.find('#save-content');
          $save.removeClass('disabled');
          return $save.addClass('btn-primary');
        });
        return this.listenTo(this.dirtyModels, 'remove', function(model, b, c) {
          var $save;
          if (_this.dirtyModels.length === 0) {
            _this.hasChanged = false;
            $save = _this.$el.find('#save-content');
            $save.addClass('disabled');
            return $save.removeClass('btn-primary');
          }
        });
      },
      onRender: function() {
        return this.$el.find('*[title]').tooltip();
      },
      signIn: function() {},
      signOut: function() {
        return this.model.signOut();
      },
      saveContent: function() {
        var $alertError, $errorBar, $label, $save, $saving, $successBar, errorCount, finished, recSave, total,
          _this = this;
        if (!this.model.get('id')) {
          return alert('You need to Sign In (and make sure you can edit) before you can save changes');
        }
        $save = this.$el.find('#save-progress-modal');
        $saving = $save.find('.saving');
        $alertError = $save.find('.alert-error');
        $successBar = $save.find('.progress > .bar.success');
        $errorBar = $save.find('.progress > .bar.error');
        $label = $save.find('.label');
        total = this.dirtyModels.length;
        errorCount = 0;
        finished = false;
        recSave = function() {
          var model, saving;
          $successBar.width(((total - _this.dirtyModels.length - errorCount) * 100 / total) + '%');
          $errorBar.width((errorCount * 100 / total) + '%');
          if (_this.dirtyModels.length === 0) {
            if (errorCount === 0) {
              finished = true;
              return $save.modal('hide');
            } else {
              return $alertError.removeClass('hide');
            }
          } else {
            model = _this.dirtyModels.first();
            $label.text(model.get('title'));
            saving = model.save(null, {
              success: function() {
                model.set({
                  _isDirty: false
                });
                return recSave();
              },
              error: function() {
                return errorCount += 1;
              }
            });
            if (!saving) {
              console.log("Skipping " + model.id + " because it is not valid");
              return recSave();
            }
          }
        };
        $alertError.addClass('hide');
        $saving.removeClass('hide');
        $save.modal('show');
        recSave();
        return setTimeout(function() {
          if (total && (!finished || errorCount)) {
            $save.modal('show');
            $alertError.removeClass('hide');
            return $saving.addClass('hide');
          }
        }, 2000);
      }
    });
    AddItemView = Marionette.ItemView.extend({
      template: ADD_ITEM_VIEW,
      tagName: 'li',
      events: {
        'click button': 'addItem'
      },
      addItem: function() {
        var ContentType, content, _base;
        ContentType = this.model.get('modelType');
        content = new ContentType();
        Models.WORKSPACE.add(content);
        if (typeof (_base = this.options).addToContext === "function") {
          _base.addToContext(content);
        }
        return typeof content.editAction === "function" ? content.editAction() : void 0;
      }
    });
    exports.AddView = Marionette.CompositeView.extend({
      template: ADD_VIEW,
      itemView: AddItemView,
      itemViewContainer: '.btn-group > ul',
      tagName: 'span'
    });
    BookEditNodeView = Marionette.CompositeView.extend({
      template: BOOK_EDIT_NODE,
      tagName: 'li',
      itemViewContainer: '> ol',
      events: {
        'click > .editor-node-body > .editor-expand-collapse': 'toggleExpanded',
        'click > .editor-node-body > .no-edit-action': 'toggleExpanded',
        'click > .editor-node-body > .edit-action': 'editAction',
        'click > .editor-node-body > .edit-settings': 'editSettings'
      },
      isExpanded: false,
      hasRendered: false,
      toggleExpanded: function() {
        return this.expand(!this.isExpanded);
      },
      expand: function(isExpanded) {
        this.isExpanded = isExpanded;
        this.$el.toggleClass('editor-node-expanded', this.isExpanded);
        if (this.isExpanded && !this.hasRendered) {
          return this.render();
        }
      },
      _renderChildren: function() {
        if (this.isRendered) {
          if (this.isExpanded) {
            Marionette.CollectionView.prototype._renderChildren.call(this);
            this.triggerMethod('composite:collection:rendered');
          }
          return this.hasRendered = this.isExpanded;
        }
      },
      editAction: function() {
        this.model.editAction();
        return this.expand(true);
      },
      editSettings: function() {
        var contentModel, newTitle, originalTitle, _ref1, _ref2, _ref3, _ref4;
        if (this.model !== this.model.dereference()) {
          contentModel = this.model.dereference();
          originalTitle = (contentModel != null ? contentModel.get('title') : void 0) || this.model.get('title');
          newTitle = prompt('Edit Title. Enter a single "-" to delete this node in the ToC', originalTitle);
          if ('-' === newTitle) {
            return (_ref1 = this.model.parent) != null ? (_ref2 = _ref1.children()) != null ? _ref2.remove(this.model) : void 0 : void 0;
          } else if (newTitle === (contentModel != null ? contentModel.get('title') : void 0)) {
            return this.model.unset('title');
          } else if (newTitle) {
            return this.model.set('title', newTitle);
          }
        } else {
          originalTitle = this.model.get('title');
          newTitle = prompt('Edit Title. Enter a single "-" to delete this node in the ToC', originalTitle);
          if ('-' === newTitle) {
            return (_ref3 = this.model.parent) != null ? (_ref4 = _ref3.children()) != null ? _ref4.remove(this.model) : void 0 : void 0;
          } else {
            if (newTitle) {
              return this.model.set('title', newTitle);
            }
          }
        }
      },
      initialize: function() {
        var contentModel,
          _this = this;
        this.collection = this.model.children();
        this.listenTo(this.model, 'all', function(name, model, collection, options) {
          if (model !== _this.model) {
            return;
          }
          switch (name) {
            case 'change':
              break;
            case 'change:title':
              return _this.render();
            case 'change:treeNode':
              break;
          }
        });
        if (this.collection) {
          this.listenTo(this.collection, 'add', function() {
            if (_this.collection.length === 1) {
              return _this.expand(true);
            }
          });
          this.listenTo(this.collection, 'remove', function() {
            if (_this.collection.length === 0) {
              return _this.render();
            }
          });
          this.listenTo(this.collection, 'reset', function() {
            return _this.render();
          });
          this.listenTo(this.collection, 'all', function(name, model, collection, options) {
            if (options == null) {
              options = collection;
            }
            switch (name) {
              case 'change':
                break;
              case 'change:title':
                break;
              case 'change:treeNode':
                break;
              default:
                if (_this.model === (options != null ? options.parent : void 0)) {
                  return _this.render();
                }
            }
          });
        }
        if (this.model !== this.model.dereference()) {
          contentModel = this.model.dereference();
          return this.listenTo(contentModel, 'change:title', function(newTitle, model, options) {
            if (!_this.model.get('title')) {
              return _this.render();
            }
          });
        }
      },
      templateHelpers: function() {
        var _ref1;
        return {
          children: (_ref1 = this.collection) != null ? _ref1.length : void 0,
          content: this.model !== this.model.dereference() ? this.model.dereference().toJSON() : void 0,
          editAction: !!this.model.editAction,
          parent: !!this.model.parent
        };
      },
      onRender: function() {
        var $body,
          _this = this;
        this.$el.attr('data-media-type', this.model.mediaType);
        $body = this.$el.children('.editor-node-body');
        return Aloha.ready(function() {
          var expandNode, expandTimeout, validSelectors;
          _EnableContentDragging(_this.model, $body.children('*[data-media-type]'));
          validSelectors = _.map(_this.model.accepts(), function(mediaType) {
            return "*[data-media-type=\"" + mediaType + "\"]";
          });
          validSelectors = validSelectors.join(',');
          expandTimeout = null;
          expandNode = function() {
            var _ref1;
            if (((_ref1 = _this.collection) != null ? _ref1.length : void 0) > 0) {
              return _this.toggleExpanded(true);
            }
          };
          return $body.children('.editor-drop-zone').add(_this.$el.children('.editor-drop-zone')).droppable({
            greedy: true,
            addClasses: false,
            accept: validSelectors,
            activeClass: 'editor-drop-zone-active',
            hoverClass: 'editor-drop-zone-hover',
            drop: function(evt, ui) {
              var $drag, $drop, delay;
              $drag = ui.draggable;
              $drop = jQuery(evt.target);
              delay = function() {
                var col, drag, index, testNode;
                drag = $drag.data('editor-model');
                testNode = _this.model;
                while (testNode) {
                  if ((drag.cid === testNode.cid) || (testNode.id && drag.id === testNode.id)) {
                    return;
                  }
                  testNode = testNode.parent;
                }
                if ($drop.hasClass('editor-drop-zone-before')) {
                  col = _this.model.parent.children();
                  index = col.indexOf(_this.model);
                  return _this.model.parent.addChild(drag, index);
                } else if ($drop.hasClass('editor-drop-zone-after')) {
                  col = _this.model.parent.children();
                  index = col.indexOf(_this.model);
                  return _this.model.parent.addChild(drag, index + 1);
                } else if ($drop.hasClass('editor-drop-zone-in')) {
                  return _this.model.addChild(drag);
                } else {
                  throw 'BUG. UNKNOWN DROP CLASS';
                }
              };
              return setTimeout(delay, 100);
            }
          });
        });
      },
      appendHtml: function(cv, iv, index) {
        var $container, $prevChild;
        $container = this.getItemViewContainer(cv);
        $prevChild = $container.children().eq(index);
        if ($prevChild[0]) {
          return iv.$el.insertBefore($prevChild);
        } else {
          return $container.append(iv.el);
        }
      }
    });
    exports.BookEditView = Marionette.CompositeView.extend({
      template: BOOK_EDIT,
      itemView: BookEditNodeView,
      itemViewContainer: '> nav > ol',
      events: {
        'click .editor-content-title': 'changeTitle',
        'click .editor-go-workspace': 'goWorkspace'
      },
      changeTitle: function() {
        var title;
        title = prompt('Enter a new Title', this.model.get('title'));
        if (title) {
          return this.model.set('title', title);
        }
      },
      goWorkspace: function() {
        return Controller.workspace();
      },
      initialize: function() {
        var _this = this;
        this.collection = this.model.children();
        return this.listenTo(this.model, 'change:title', function() {
          return _this.render();
        });
      },
      appendHtml: function(cv, iv, index) {
        var $container, $prevChild;
        $container = this.getItemViewContainer(cv);
        $prevChild = $container.children().eq(index);
        if ($prevChild[0]) {
          return iv.$el.insertBefore($prevChild);
        } else {
          return $container.append(iv.el);
        }
      }
    });
    return exports;
  });

}).call(this);
