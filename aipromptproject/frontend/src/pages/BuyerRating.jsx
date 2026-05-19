import React from "react";
import { mockBuyerRatings } from "../data/mockData";

export default function BuyerRating() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-violet-300">
          Buyer Rating
        </p>

        <h1 className="mt-1 text-2xl font-black text-white">
          Ratings You Gave to Creator Prompt Posts
        </h1>
      </div>

      <div className="space-y-3">
        {mockBuyerRatings.map((item) => (
          <div key={item.id} className="surface p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-white">{item.promptTitle}</p>

                <p className="mt-1 text-sm text-slate-400">
                  Creator: {item.creatorName}
                </p>
              </div>

              <span className="badge-pill bg-yellow-500/15 text-yellow-300">
                ★ {item.rating}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {item.review}
            </p>

            <p className="mt-3 text-xs text-slate-500">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
