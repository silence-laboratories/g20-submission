'use client';
import BankViewLoanDialog from './view-loan-dialog';
import ViewInsightsDialog from './view-insights-dialog';
import { BankApplication } from './columns';

interface CellActionProps {
  data: BankApplication;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {


  return (

    <div className="flex space-x-2">
      {data.insightStatus === "generated" ? <ViewInsightsDialog loan={data} /> :
        <BankViewLoanDialog loan={data} />}
    </div>
  );
};
