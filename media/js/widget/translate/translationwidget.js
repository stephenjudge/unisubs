// Amara, universalsubtitles.org
//
// Copyright (C) 2012 Participatory Culture Foundation
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see
// http://www.gnu.org/licenses/agpl-3.0.html.

goog.provide('unisubs.translate.TranslationWidget');

/**
 * @constructor
 * @param {Object.<string, *>} subtitle Base language subtitle in json format
 * @param {unisubs.subtitle.EditableCaption} translation
 */
unisubs.translate.TranslationWidget = function(subtitle, translation, dialog) {
    goog.ui.Component.call(this);
    this.subtitle_ = subtitle;
    this.dialog_ = dialog;
    this.videoURL_ = this.dialog_.getVideoPlayerInternal().videoSource_.videoURL_ || '';

    /**
     * @type {unisubs.subtitle.EditableCaption}
     */
    this.translation_ = translation;
};

goog.inherits(unisubs.translate.TranslationWidget, goog.ui.Component);

unisubs.translate.TranslationWidget.prototype.getSubtitle = function(){
    return this.subtitle_;
};
unisubs.translate.TranslationWidget.prototype.getOriginalValue = function(){
    return this.subtitle_.text;
};
unisubs.translate.TranslationWidget.prototype.getSubJson = function() {
    return {
        'subtitle_id': this.getCaptionID(),
        'text': this.translateInput_.value
    };
};
unisubs.translate.TranslationWidget.prototype.createDom = function() {

    var $d = goog.bind(this.getDomHelper().createDom, this.getDomHelper());

    this.setElementInternal(
        $d('li', null,
           $d('div', null,
              $d('span', {'className': 'unisubs-timestamp-time-fixed'}, 
                         unisubs.formatTime(this.subtitle_['start_time'])),
              $d('span', 'unisubs-title unisubs-title-notime', this.subtitle_['text']),
              this.loadingIndicator_ = $d('span', 'unisubs-loading-indicator', 'loading...')
           ),
           this.translateInput_ = $d('textarea', 'unisubs-translateField')
        )
    );
    
    this.getHandler()
        .listen(
            this.translateInput_, goog.events.EventType.KEYUP,
            goog.bind(this.inputKeyUp_, this, true))
        .listen(
            this.translateInput_, goog.events.EventType.BLUR,
            goog.bind(this.inputLostFocus_, this, true))
        .listen(
            this.translateInput_, goog.events.EventType.FOCUS,
            this.inputGainedFocus_);
    this.translateInput_.value = this.translation_ ? this.translation_.getText() : '';
};
unisubs.translate.TranslationWidget.prototype.inputGainedFocus_ = function(event) {
    this.onFocusText_ = this.translateInput_.value;

    if (this.videoURL_.indexOf('vimeo.com') === -1) {
        this.dialog_.getVideoPlayerInternal().setPlayheadTime(this.subtitle_['start_time']);
        this.dialog_.getVideoPlayerInternal().pause();
    }
};
unisubs.translate.TranslationWidget.prototype.inputKeyUp_ = function(track) {
    this.onKeyUpText_ = this.translateInput_.value;

    if (this.videoURL_.indexOf('vimeo.com') === -1) {
        var editableCaptionSet = this.dialog_.translationPanel_.getTranslationList().baseLanguageCaptionSet_;
        var editableCaption = editableCaptionSet.captionByID(this.subtitle_.subtitle_id);

        if (this.onKeyUpText_ !== '') {
            editableCaption.setText(this.onKeyUpText_);
            this.dialog_.getVideoPlayerInternal().showCaptionText(this.onKeyUpText_);
            this.textHasBeenChanged_ = true;
        } else {
            if (this.textHasBeenChanged_) {
                var originalText = editableCaption.getOriginalText();
                editableCaption.setText(originalText);
                this.dialog_.getVideoPlayerInternal().showCaptionText(originalText);
                this.textHasBeenChanged_ = false;
            }
        }
    }
}
unisubs.translate.TranslationWidget.prototype.inputLostFocus_ = function(track) {
    var value = goog.string.trim(this.translateInput_.value);
    var edited = value != this.onFocusText_;
    if (track && edited) {
        if (this.onFocusText_ == "")
            unisubs.SubTracker.getInstance().trackAdd(this.getCaptionID());
        else
            unisubs.SubTracker.getInstance().trackEdit(this.getCaptionID());
    }
    this.translation_.setText(value);
};
unisubs.translate.TranslationWidget.prototype.setTranslationContent = function(value){
    this.translateInput_.value = value;
    this.inputLostFocus_(false);
};
unisubs.translate.TranslationWidget.prototype.setEnabled = function(enabled) {
    this.translateInput_.disabled = !enabled;
    if (!enabled)
        this.translateInput_.value = '';
};
unisubs.translate.TranslationWidget.prototype.getCaptionID = function() {
    return this.subtitle_['subtitle_id'];
};

/**
 * Return if translate input has some value
 * @return {boolean}
 */
unisubs.translate.TranslationWidget.prototype.isEmpty = function(){
    return ! goog.string.trim(this.translateInput_.value);
};

unisubs.translate.TranslationWidget.prototype.showLoadingIndicator = function(){
    unisubs.style.showElement(this.loadingIndicator_, true);
};
unisubs.translate.TranslationWidget.prototype.hideLoadingIndicator = function(){
    unisubs.style.showElement(this.loadingIndicator_, false);
};
