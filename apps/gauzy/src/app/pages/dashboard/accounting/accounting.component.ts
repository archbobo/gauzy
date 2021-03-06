import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '../../../@core/services/store.service';
import { EmployeeStatisticsService } from '../../../@core/services/employee-statistics.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { IAggregatedEmployeeStatistic, IOrganization } from '@gauzy/models';
import {
	SelectedEmployee,
	ALL_EMPLOYEES_SELECTED
} from '../../../@theme/components/header/selectors/employee/employee.component';
import { Router } from '@angular/router';

@Component({
	selector: 'ga-accounting',
	templateUrl: './accounting.component.html',
	styleUrls: [
		'../../organizations/edit-organization/edit-organization.component.scss',
		'./accounting.component.scss'
	]
})
export class AccountingComponent implements OnInit, OnDestroy {
	private _ngDestroy$ = new Subject<void>();

	aggregatedEmployeeStatistics: IAggregatedEmployeeStatistic;
	selectedDate: Date;
	selectedOrganization: IOrganization;
	selectedEmployee: SelectedEmployee;

	constructor(
		private store: Store,
		private readonly router: Router,
		private employeeStatisticsService: EmployeeStatisticsService
	) {}

	ngOnInit() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((organization) => {
				this.selectedOrganization = organization;
				this.loadData(organization);
			});

		this.store.selectedDate$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((date) => {
				this.selectedDate = date;
				if (this.selectedOrganization) {
					this.loadData(this.selectedOrganization);
				}
			});

		this.store.selectedEmployee$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((employee) => {
				if (employee && employee.id) {
					this.navigateToEmployeeStatistics();
				}
			});
	}

	navigateToEmployeeStatistics() {
		this.router.navigate(['/pages/dashboard/hr']);
	}

	loadData = async (organization) => {
		if (organization) {
			const { tenantId } = organization;
			this.aggregatedEmployeeStatistics = await this.employeeStatisticsService.getAggregateStatisticsByOrganizationId(
				{
					organizationId: organization.id,
					tenantId,
					filterDate:
						this.selectedDate || this.store.selectedDate || null
				}
			);
		}
	};

	selectEmployee(
		employee: SelectedEmployee,
		firstName: string,
		lastName: string,
		imageUrl: string
	) {
		this.store.selectedEmployee = employee || ALL_EMPLOYEES_SELECTED;
		this.store.selectedEmployee.firstName = firstName;
		this.store.selectedEmployee.lastName = lastName;
		this.store.selectedEmployee.imageUrl = imageUrl;
		this.navigateToEmployeeStatistics();
	}

	ngOnDestroy(): void {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
