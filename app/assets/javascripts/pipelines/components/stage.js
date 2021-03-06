/* global Flash */
import StatusIconEntityMap from '../../ci_status_icons';

export default {
  props: {
    stage: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      builds: '',
      spinner: '<span class="fa fa-spinner fa-spin"></span>',
    };
  },

  updated() {
    if (this.builds) {
      this.stopDropdownClickPropagation();
    }
  },

  methods: {
    fetchBuilds(e) {
      const ariaExpanded = e.currentTarget.attributes['aria-expanded'];

      if (ariaExpanded && (ariaExpanded.textContent === 'true')) return null;

      return this.$http.get(this.stage.dropdown_path)
        .then((response) => {
          this.builds = JSON.parse(response.body).html;
        })
        .catch(() => {
          // If dropdown is opened we'll close it.
          if (this.$el.classList.contains('open')) {
            $(this.$refs.dropdown).dropdown('toggle');
          }

          const flash = new Flash('Something went wrong on our end.');
          return flash;
        });
    },

    /**
     * When the user right clicks or cmd/ctrl + click in the job name
     * the dropdown should not be closed and the link should open in another tab,
     * so we stop propagation of the click event inside the dropdown.
     *
     * Since this component is rendered multiple times per page we need to guarantee we only
     * target the click event of this component.
     */
    stopDropdownClickPropagation() {
      $(this.$el.querySelectorAll('.js-builds-dropdown-list a.mini-pipeline-graph-dropdown-item'))
        .on('click', (e) => {
          e.stopPropagation();
        });
    },
  },
  computed: {
    buildsOrSpinner() {
      return this.builds ? this.builds : this.spinner;
    },
    dropdownClass() {
      if (this.builds) return 'js-builds-dropdown-container';
      return 'js-builds-dropdown-loading builds-dropdown-loading';
    },
    buildStatus() {
      return `Build: ${this.stage.status.label}`;
    },
    tooltip() {
      return `has-tooltip ci-status-icon ci-status-icon-${this.stage.status.group}`;
    },
    triggerButtonClass() {
      return `mini-pipeline-graph-dropdown-toggle has-tooltip js-builds-dropdown-button ci-status-icon-${this.stage.status.group}`;
    },
    svgHTML() {
      return StatusIconEntityMap[this.stage.status.icon];
    },
  },
  template: `
    <div>
      <button
        @click="fetchBuilds($event)"
        :class="triggerButtonClass"
        :title="stage.title"
        data-placement="top"
        data-toggle="dropdown"
        type="button"
        :aria-label="stage.title"
        ref="dropdown">
        <span
          v-html="svgHTML"
          aria-hidden="true">
        </span>
        <i
          class="fa fa-caret-down"
          aria-hidden="true" />
      </button>
      <ul
        ref="dropdown-content"
        class="dropdown-menu mini-pipeline-graph-dropdown-menu js-builds-dropdown-container">
        <div
          class="arrow-up"
          aria-hidden="true"></div>
        <div
          :class="dropdownClass"
          class="js-builds-dropdown-list scrollable-menu"
          v-html="buildsOrSpinner">
        </div>
      </ul>
    </div>
  `,
};
