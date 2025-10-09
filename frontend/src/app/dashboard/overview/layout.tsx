import PageContainer from '@/components/layout/page-container';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import React from 'react';

export default function OverViewLayout() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Welcome 👋
          </h2>
        </div>

        <p className='mb-6'>Get started below</p>
        

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-3 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-3 px-24'>
          <a href='/dashboard/apply-loan'>
            <Card className='@container/card'>
              <CardHeader>
                <CardTitle className='text-xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                  Apply for a Loan
                </CardTitle>
                <CardDescription>Provide loan application details</CardDescription>
                {/* <CardAction>
                  <Badge variant='outline'>
                    <IconTrendingUp />
                    +12.5%
                  </Badge>
                </CardAction> */}
              </CardHeader>
              {/* <CardFooter className='flex-col items-start gap-1.5 text-sm'>
                <div className='line-clamp-1 flex gap-2 font-medium'>
                  Trending up this month <IconTrendingUp className='size-4' />
                </div>
                <div className='text-muted-foreground'>
                  Visitors for the last 6 months
                </div>
              </CardFooter> */}
            </Card>
          </a>
          <a href='/dashboard/applications'>
          <Card className='@container/card'>
            <CardHeader>

              <CardTitle className='text-xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                Applications
              </CardTitle>
              <CardDescription>Manage your Loan Applications</CardDescription>
              {/* <CardAction>
                <Badge variant='outline'>
                  <IconTrendingDown />
                  -20%
                </Badge>
              </CardAction> */}
            </CardHeader>
            {/* <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Down 20% this period <IconTrendingDown className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Acquisition needs attention
              </div>
            </CardFooter> */}
          </Card>
          </a>

          {/* <AreaGraphSkeleton /> */}
        </div>
        {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div> */}
      </div>
    </PageContainer>
  );
}
