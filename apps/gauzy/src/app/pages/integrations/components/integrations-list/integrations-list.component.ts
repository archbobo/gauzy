import { Component, OnInit } from '@angular/core';
import { IIntegrationViewModel } from '@gauzy/models';
import { IntegrationsStoreService } from 'apps/gauzy/src/app/@core/services/integrations-store.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'ngx-integrations-list',
	templateUrl: './integrations-list.component.html',
	styleUrls: ['./integrations-list.component.scss']
})
export class IntegrationsListComponent implements OnInit {
	integrations$: Observable<IIntegrationViewModel[]> = this._integrationsStore
		.integrations$;
	integrationGroups$: Observable<any[]> = this._integrationsStore
		.integrationGroups$;
	selectedIntegrationTypeId$: Observable<string> = this._integrationsStore
		.selectedIntegrationTypeId$;
	selectedIntegrationFilter$: Observable<string> = this._integrationsStore
		.selectedIntegrationFilter$;
	isLoading$: Observable<boolean> = this._integrationsStore.isLoading$;

	constructor(private _integrationsStore: IntegrationsStoreService) {}

	ngOnInit() {}

	setSelectedIntegrationType(integrationTypeId) {
		this._integrationsStore.setSelectedIntegrationTypeId(integrationTypeId);
	}

	setSelectedIntegrationFilter(filter) {
		this._integrationsStore.setSelectedIntegrationFilter(filter);
	}

	doSearch({ target: { value } }) {
		this._integrationsStore.searchIntegration(value);
	}

	/*
	 * Get integrations filters
	 */
	getFilters() {
		return [
			{ key: 'All', value: 'all' },
			{ key: 'Free', value: 'false' },
			{ key: 'Paid', value: 'true' }
		];
	}
}
