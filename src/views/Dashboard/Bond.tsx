import React, {useCallback, useMemo} from 'react';
import ExchangeCard from './componentsBond/ExchangeCard';
import useBondStats from '../../hooks/useBondStats';
import useBombFinance from '../../hooks/useBombFinance';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import {useTransactionAdder} from '../../state/transactions/hooks';
import ExchangeStat from './componentsBond/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import useBondsPurchasable from '../../hooks/useBondsPurchasable';
import {getDisplayBalance} from '../../utils/formatBalance';
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../bomb-finance/constants';
import ExchangeCardBtn from './componentsBond/ExchangeCardBtn';

const Bond: React.FC = () => {
  const bombFinance = useBombFinance();
  const addTransaction = useTransactionAdder();
  const bondStat = useBondStats();
  const cashPrice = useCashPriceInLastTWAP();

  const bondsPurchasable = useBondsPurchasable();

  const bondBalance = useTokenBalance(bombFinance?.BBOND);

  const handleBuyBonds = useCallback(
    async (amount: string) => {
      const tx = await bombFinance.buyBonds(amount);
      addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} BBOND with ${amount} BOMB`,
      });
    },
    [bombFinance, addTransaction],
  );

  const handleRedeemBonds = useCallback(
    async (amount: string) => {
      const tx = await bombFinance.redeemBonds(amount);
      addTransaction(tx, {summary: `Redeem ${amount} BBOND`});
    },
    [bombFinance, addTransaction],
  );

  const isBondRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);
  const isBondPurchasable = useMemo(() => Number(bondStat?.tokenInFtm) < 1.01, [bondStat]);

  return (
    <>
        <div className='row p-0 m-0 d-flex justify-content-between'>
            <div className='col-3 p-0'><p className='text-start m-0'>Current Price: (Bomb)^2</p>
                <h5 className='text-start m-0'>BBond = 
                    <ExchangeStat
                        tokenName="10,000 BBOND"
                        description="Current Price: (BOMB)^2"
                        price={Number(bondStat?.tokenInFtm).toFixed(4) || '-'}
                    /> 
                </h5>
            </div>
            <div className='col-2 p-0'><p className='text-center m-0'>Available to Purchase:</p>
                <h5 className='text-center m-0'>
                    <ExchangeCard
                        action="Purchase"
                        fromToken={bombFinance.BOMB}
                        fromTokenName="BOMB"
                        toToken={bombFinance.BBOND}
                        toTokenName="BBOND"
                        priceDesc={
                        !isBondPurchasable
                            ? 'BOMB is over peg'
                            : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND'
                        }
                        onExchange={handleBuyBonds}
                        disabled={!bondStat || isBondRedeemable}
                    />
                </h5>
            </div>
            <div className='col-2 p-0'><p className='text-center m-0'>Available to Redeem:</p>
                <h5 className='text-center m-0'>
                    <ExchangeCard
                        action="Redeem"
                        fromToken={bombFinance.BBOND}
                        fromTokenName="BBOND"
                        toToken={bombFinance.BOMB}
                        toTokenName="BOMB"
                        priceDesc={`${getDisplayBalance(bondBalance)} BBOND`}
                        onExchange={handleRedeemBonds}
                        disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                        disabledDescription={!isBondRedeemable ? `Enabled when 10,000 BOMB > ${BOND_REDEEM_PRICE} BTC` : null}
                    />
                </h5>
            </div>
            <div className='col-5 p-0 d-flex align-items-center justify-content-end'>
                <div className='row m-0 p-0 w-75'>
                    <span className='col-6'>
                        <ExchangeCardBtn
                            action="Purchase"
                            fromToken={bombFinance.BOMB}
                            fromTokenName="Purchase BOMB"
                            toToken={bombFinance.BBOND}
                            toTokenName="BBOND"
                            priceDesc={!isBondPurchasable ? 'BOMB is over peg' : getDisplayBalance(bondsPurchasable, 18, 4) + ' BBOND'}
                            onExchange={handleBuyBonds}
                            disabled={!bondStat || isBondRedeemable}
                        />
                    </span>
                    <span className='col-6'> 
                        <ExchangeCardBtn
                            action="Redeem"
                            fromToken={bombFinance.BBOND}
                            fromTokenName="Redeem BBOND"
                            toToken={bombFinance.BOMB}
                            toTokenName="BOMB"
                            priceDesc={`${getDisplayBalance(bondBalance)} BBOND`}
                            onExchange={handleRedeemBonds}
                            disabled={!bondStat || bondBalance.eq(0) || !isBondRedeemable}
                            disabledDescription={!isBondRedeemable ? `Redeem BBond` : null}
                        />   
                    </span>
                </div>
            </div>
        </div>  
    </>
  );
};

export default Bond;
