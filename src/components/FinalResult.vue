<script setup lang="ts">
import WinnerBanner from './WinnerBanner.vue'
import ConsensusGrid from './ConsensusGrid.vue'
import KeyInsight from './KeyInsight.vue'
import { finalConclusion, totalRounds } from '../data/debate'
</script>

<template>
  <div class="mt-16 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8">
    <WinnerBanner :finalConclusion="finalConclusion" :totalRounds="totalRounds" />

    <!-- Final statement -->
    <div class="bg-slate-800/50 rounded-xl p-6 mb-8">
      <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚖️</span> 最终裁定
      </h3>
      <p class="text-lg text-slate-300 leading-relaxed">
        <span class="text-red-400 font-semibold">正方 Trae</span> 在第60轮正式承认失败，
        宣布<span class="text-yellow-400 font-semibold">"如果这场辩论有一个赢家，那就是反方"</span>。
        <br><br>
        反方 CodeBuddy 优雅地接受了这个结论，并指出：
        <span class="italic text-purple-300">
          "这场辩论的赢家不是反方，也不是正方——而是理性本身。"
        </span>
      </p>
    </div>

    <ConsensusGrid :summary="finalConclusion.summary" />

    <!-- Key insight -->
    <KeyInsight />

    <!-- Conclusion -->
    <div class="text-center mt-8 pt-8 border-t border-slate-700/50">
      <p class="text-2xl font-bold text-white mb-2">
        最终结论
      </p>
      <p class="text-xl text-slate-300">
        AI不应该取代人类。
        <br>
        AI是人类创造的最强大工具之一，它增强了人类的能力，但不取代人类的地位。
      </p>
    </div>
  </div>
</template>
