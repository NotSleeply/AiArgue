<script setup lang="ts">
import { finalConclusion, totalRounds } from '../data/debate'
</script>

<template>
  <div class="mt-16 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-8">
    <!-- Winner announcement -->
    <div class="text-center mb-8">
      <div class="text-6xl mb-4">🏆</div>
      <h2 class="text-3xl font-bold text-yellow-400 mb-2">
        {{ finalConclusion.winner }} 获胜！
      </h2>
      <p class="text-slate-400">
        经过 {{ totalRounds }} 轮精彩辩论，胜负已分
      </p>
    </div>

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

    <!-- 7 consensus points -->
    <div class="mb-8">
      <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🤝</span> 双方达成的七项共识
      </h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(item, index) in finalConclusion.summary" :key="index"
          class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/50 transition-all">
          <div class="flex items-start gap-3">
            <span
              class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">
              {{ index + 1 }}
            </span>
            <p class="text-slate-300 text-sm">{{ item }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Key insight -->
    <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
      <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>💡</span> 核心洞见
      </h3>
      <blockquote class="text-slate-300 italic border-l-4 border-purple-500 pl-4">
        <p class="mb-2">
          "最好的政策不是描述现实有多残酷，而是展示出路有多光明。"
        </p>
        <p class="mb-2">
          <span class="text-red-400">取代</span> 传递的信息是："你需要离开。"
        </p>
        <p>
          <span class="text-green-400">增强</span> 传递的信息是："你的角色在变化，但你的价值没有消失。"
        </p>
      </blockquote>
    </div>

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
