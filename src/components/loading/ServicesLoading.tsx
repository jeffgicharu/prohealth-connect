import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesLoading() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className='flex flex-col h-full overflow-hidden'>
          <Skeleton className='w-full h-48' />
          <CardHeader>
            <Skeleton className='h-6 w-3/4 mb-2' />
            <Skeleton className='h-4 w-1/2' />
          </CardHeader>
          <CardContent className='flex-grow'>
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-5/6 mb-2' />
            <Skeleton className='h-4 w-4/6' />
          </CardContent>
          <CardFooter className='flex justify-between items-center border-t pt-4'>
            <Skeleton className='h-6 w-24' />
            <div className='flex space-x-2'>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-10 w-24' />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 