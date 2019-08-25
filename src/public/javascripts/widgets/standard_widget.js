import optionsService from "../services/options.js";

const WIDGET_TPL = `
<div class="card widget">
    <div class="card-header">        
        <button class="btn btn-sm widget-title" data-toggle="collapse" data-target="#[to be set]">
            Collapsible Group Item
        </button>
        
        <div class="widget-header-actions"></div>
    </div>

    <div id="[to be set]" class="collapse body-wrapper" style="transition: none;">
        <div class="card-body"></div>
    </div>
</div>
`;

class StandardWidget {
    /**
     * @param {TabContext} ctx
     * @param {object} state
     */
    constructor(ctx, state) {
        this.ctx = ctx;
        this.state = state;
        // construct in camelCase
        this.widgetName = this.constructor.name.substr(0, 1).toLowerCase() + this.constructor.name.substr(1);

    }

    getWidgetTitle() { return "Untitled widget"; }

    getHeaderActions() { return []; }

    getMaxHeight() { return null; }

    async render() {
        const widgetId = `tab-${this.ctx.tabId}-widget-${this.widgetName}`;

        this.$widget = $(WIDGET_TPL);
        this.$widget.find('[data-target]').attr('data-target', "#" + widgetId);

        this.$bodyWrapper = this.$widget.find('.body-wrapper');
        this.$bodyWrapper.attr('id', widgetId);

        if (this.state && this.state.expanded) {
            this.$bodyWrapper.collapse("show");
        }

        this.$body = this.$bodyWrapper.find('.card-body');

        const maxHeight = this.getMaxHeight();

        if (maxHeight) {
            this.$body.css("max-height", maxHeight);
            this.$body.css("overflow", "auto");
        }

        this.$widget.on('shown.bs.collapse', () => this.renderBody());
        this.$widget.on('shown.bs.collapse', () => this.ctx.stateChanged());
        this.$widget.on('hidden.bs.collapse', () => this.ctx.stateChanged());
        this.$title = this.$widget.find('.widget-title');
        this.$title.text(this.getWidgetTitle());
        this.$headerActions = this.$widget.find('.widget-header-actions');
        this.$headerActions.append(...this.getHeaderActions());

        await this.renderBody();

        return this.$widget;
    }

    async renderBody() {
        if (!this.isExpanded() || this.rendered) {
            return;
        }

        this.rendered = true;

        await this.doRenderBody();
    }

    /** for overriding */
    async doRenderBody() {}

    async isEnabled() {
        const option = await optionsService.getJsonOption(this.widgetName + 'Widget');

        return option ? option.enabled : true;
    }

    isExpanded() {
        return this.$bodyWrapper.hasClass("show");
    }

    getWidgetState() {
        return {
            name: this.widgetName,
            expanded: this.isExpanded()
        };
    }

    syncDataReceived(syncData) {}
}

export default StandardWidget;