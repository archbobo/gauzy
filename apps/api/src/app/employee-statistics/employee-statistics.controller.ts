import {
	IAggregatedEmployeeStatistic,
	IEmployeeStatistics,
	IMonthAggregatedEmployeeStatistics,
	IEmployeeStatisticsHistory
} from '@gauzy/models';
import {
	Controller,
	Get,
	HttpStatus,
	Param,
	Query,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { parseISO } from 'date-fns';
import { EmployeeStatisticsService } from './employee-statistics.service';
import { AggregatedEmployeeStatisticQuery } from './queries/aggregate-employee-statistic.query';
import { MonthAggregatedEmployeeStatisticsQuery } from './queries/month-aggregated-employee-statistics.query';
import { EmployeeStatisticsHistoryQuery } from './queries/employee-statistics-history.query';

@ApiTags('EmployeeStatistics')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class EmployeeStatisticsController {
	constructor(
		private employeeStatisticsService: EmployeeStatisticsService,
		private readonly queryBus: QueryBus
	) {}

	@ApiOperation({
		summary: 'Find aggregate for all employees by organization id'
	})
	@ApiResponse({ status: HttpStatus.OK, description: 'Found records' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No records found'
	})
	@Get('/aggregate')
	async findAggregatedByOrganizationId(
		@Query('data') data?: string
	): Promise<IAggregatedEmployeeStatistic[]> {
		const { findInput } = JSON.parse(data);
		/**
		 * JSON parse changes Date object to String type
		 * Changing Date String to Date Object using parseISO
		 */
		findInput.filterDate = findInput.filterDate
			? parseISO(findInput.filterDate)
			: null;
		return this.queryBus.execute(
			new AggregatedEmployeeStatisticQuery(findInput)
		);
	}

	@ApiOperation({ summary: 'Find by id' })
	@ApiResponse({ status: HttpStatus.OK, description: 'Found one record' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/months/:id')
	async findAllByEmloyeeId(
		@Param('id') id: string,
		@Query('data') data?: string
	): Promise<IEmployeeStatistics> {
		const { findInput } = JSON.parse(data);
		return this.employeeStatisticsService.getStatisticsByEmployeeId(
			id,
			findInput
		);
	}

	@ApiOperation({
		summary:
			'Find Aggregated Statistics by Employee id, valueDate and past N months'
	})
	@ApiResponse({ status: HttpStatus.OK, description: 'Found one record' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/months')
	async findAggregatedStatisticsByEmployeeId(
		@Query('data') data?: string
	): Promise<IMonthAggregatedEmployeeStatistics> {
		const { findInput } = JSON.parse(data);
		/**
		 * JSON parse changes Date object to String type
		 * Changing Date String to Date Object using parseISO
		 */
		findInput.valueDate = parseISO(findInput.valueDate);

		return this.queryBus.execute(
			new MonthAggregatedEmployeeStatisticsQuery(findInput)
		);
	}
	@ApiOperation({
		summary:
			'Find Statistics History by Employee id, valueDate and past N months'
	})
	@ApiResponse({ status: HttpStatus.OK, description: 'Found one record' })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'Record not found'
	})
	@Get('/history')
	async findEmployeeStatisticsHistory(
		@Query('data') data?: string
	): Promise<IEmployeeStatisticsHistory[]> {
		const { findInput } = JSON.parse(data);
		/**
		 * JSON parse changes Date object to String type
		 * Changing Date String to Date Object using parseISO
		 */
		findInput.valueDate = parseISO(findInput.valueDate);

		return this.queryBus.execute(
			new EmployeeStatisticsHistoryQuery(findInput)
		);
	}
}
