#!/usr/bin/env zx

import { $, cd, echo, fs } from 'zx';
import { spawn } from 'child_process';

echo('🚀 GAN Evolution Engine v2.0 - Autonomous Evolution');

// ============================================
// 核心引擎：真正的自主进化能力
// ============================================

// 1. Generator - 真正的代码实现
async function generate(projectPath, strategy) {
  echo(`\n📝 Generator: Implementing with strategy v${strategy.version}...`);
  
  // 读取策略文档
  const strategyDoc = await fs.readFile(
    `memory/strategy/v${strategy.version}.md`,
    'utf-8'
  ).catch(() => '# Strategy Document\n\nLoading...');
  
  // 调用 AI Agent 实现代码
  const evolutionPrompt = `
你是 Generator(生成器)，负责实现高质量代码。

当前任务：${strategy.task}

遵循策略版本：v${strategy.version}
策略文档：
${strategyDoc}

质量要求：
- 编译通过
- 测试通过
- 无 Critical/High 问题
- 遵循问题模式库

实现完成后输出：
1. 文件列表
2. 测试结果
3. 待审查项
`.trim();
  
  // 使用 sessions_spawn 调用 AI Agent
  const result = await callAIAgent('Generator', evolutionPrompt);
  
  // 写入文件
  await writeFiles(result.files);
  
  // 运行测试
  const testResult = await runTests(projectPath);
  
  echo(`✅ Generator completed: ${result.files.length} files`);
  
  return { files: result.files, testResult };
}

// 2. Discriminator - 真正的代码审查
async function discriminate(projectPath) {
  echo('\n🔍 Discriminator: Reviewing code...');
  
  // 获取修改的文件
  const changedFiles = await getChangedFiles(projectPath);
  
  // 调用 AI Agent 审查
  const reviewPrompt = `
你是 Discriminator(判别器)，负责审查代码质量。

审查范围：${changedFiles.length} files

审查维度：
1. 安全性 (Critical/High 必须报告)
2. 性能 (High/Medium)
3. 可读性 (Medium/Low)
4. 规格符合
5. 测试覆盖

输出格式 (JSON)：
{
  "issues": [
    {
      "id": "P001",
      "severity": "Critical|High|Medium|Low",
      "file": "path/to/file.ts",
      "line": 10,
      "description": "...",
      "fix": "..."
    }
  ]
}
`.trim();
  
  const review = await callAIAgent('Discriminator', reviewPrompt);
  
  // 运行 ESLint
  const lintResult = await runESLint(projectPath);
  
  // 运行安全扫描
  const securityScan = await runSecurityScan(projectPath);
  
  const issues = parseIssues(review, lintResult, securityScan);
  
  const criticalHigh = issues.filter(
    i => i.severity === 'Critical' || i.severity === 'High'
  ).length;
  
  echo(`🔍 Found ${issues.length} issues (${criticalHigh} Critical/High)`);
  
  return { issues, lintResult, securityScan };
}

// 3. Evolver - 真正的策略进化
async function evolve(review, strategy) {
  echo('\n🧬 Evolver: Updating strategy...');
  
  // 识别问题模式
  const patterns = identifyPatterns(review.issues);
  
  // 调用 AI Agent 更新策略
  const evolvePrompt = `
你是 Evolver(进化器)，负责更新进化策略。

当前策略版本：v${strategy.version}
新发现问题：${review.issues.length} issues
识别模式：${patterns.length} patterns

任务：
1. 更新策略文档到 v${strategy.version + 0.1}
2. 添加新问题模式
3. 记录进化日志

输出格式：
{
  "newVersion": "v1.1",
  "changes": ["..."],
  "newPatterns": ["P001", "P002"],
  "summary": "..."
}
`.trim();
  
  const evolution = await callAIAgent('Evolver', evolvePrompt);
  
  // 写入策略文档
  await writeStrategy(evolution.newVersion, evolution.changes);
  
  // 更新模式库
  await updatePatterns(patterns);
  
  // 记录进化日志
  await logEvolution({
    round: strategy.round,
    oldVersion: strategy.version,
    newVersion: evolution.newVersion,
    changes: evolution.changes,
    patterns: patterns
  });
  
  echo(`🧬 Strategy evolved: v${strategy.version} → v${evolution.newVersion}`);
  
  return {
    version: evolution.newVersion,
    changes: evolution.changes
  };
}

// 4. 自主循环控制器
async function autonomousLoop(projectPath, options = {}) {
  const defaultOptions = {
    minRounds: 2,
    maxRounds: 5,
    interactive: false,
    targetQuality: { critical: 0, high: 0 }
  };
  
  const opts = { ...defaultOptions, ...options };
  
  echo('\n🔄 Starting Autonomous Evolution Loop...\n');
  
  let strategy = {
    version: 1.0,
    task: options.task || 'Implement feature',
    round: 0
  };
  
  let round = 0;
  
  while (true) {
    round++;
    strategy.round = round;
    
    echo(`\n${'='.repeat(60)}`);
    echo(`🔄 Round ${round}/${opts.maxRounds}`);
    echo(`${'='.repeat(60)}\n`);
    
    // 1. Generator 实现
    const genResult = await generate(projectPath, strategy);
    
    // 2. Discriminator 审查
    const review = await discriminate(projectPath);
    
    // 3. 质量检查
    const criticalHigh = review.issues.filter(
      i => i.severity === 'Critical' || i.severity === 'High'
    ).length;
    
    const qualityMet = criticalHigh === opts.targetQuality.critical &&
                       round >= opts.minRounds;
    
    if (qualityMet) {
      echo('\n✅ Quality target met! Evolution complete.\n');
      break;
    }
    
    if (round >= opts.maxRounds) {
      echo('\n⚠️ Max rounds reached. Evolution complete.\n');
      break;
    }
    
    // 4. Evolver 更新策略
    strategy = await evolve(review, strategy);
    
    // 5. 等待用户确认 (交互模式)
    if (opts.interactive) {
      const answer = await question('\nContinue to next round? (Y/n) ');
      if (answer.toLowerCase() === 'n') {
        echo('\n⚠️ Stopped by user.\n');
        break;
      }
    }
  }
  
  // 6. 最终报告
  await generateFinalReport(round, strategy);
  
  echo('\n🎉 Autonomous Evolution Loop completed!\n');
}

// ============================================
// 工具函数
// ============================================

async function callAIAgent(role, prompt) {
  // 使用 sessions_spawn 调用 AI Agent
  // 这里需要集成 OpenClaw 的 sessions_spawn API
  echo(`  🤖 Calling AI Agent: ${role}`);
  
  // TODO: 实现真实的 AI Agent 调用
  // const session = await sessions_spawn({
  //   task: prompt,
  //   label: `gan-${role.toLowerCase()}`,
  //   runtime: 'subagent'
  // });
  
  // 临时返回模拟数据
  return {
    files: [],
    issues: [],
    changes: []
  };
}

async function writeFiles(files) {
  for (const file of files) {
    await fs.writeFile(file.path, file.content);
  }
}

async function runTests(projectPath) {
  try {
    cd(projectPath);
    await $`npm test`;
    return { passed: true };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}

async function getChangedFiles(projectPath) {
  cd(projectPath);
  const { stdout } = await $`git diff --name-only HEAD`;
  return stdout.trim().split('\n').filter(Boolean);
}

async function runESLint(projectPath) {
  try {
    cd(projectPath);
    await $`npm run lint`;
    return { passed: true };
  } catch (error) {
    return { passed: false, issues: parseESLintOutput(error.stdout) };
  }
}

async function runSecurityScan(projectPath) {
  // 使用 npm audit 或其他安全扫描工具
  try {
    cd(projectPath);
    await $`npm audit`;
    return { passed: true };
  } catch (error) {
    return { passed: false, vulnerabilities: parseAuditOutput(error.stdout) };
  }
}

function parseIssues(review, lintResult, securityScan) {
  // 合并所有问题源
  const issues = [...(review.issues || [])];
  
  if (!lintResult.passed) {
    issues.push(...(lintResult.issues || []));
  }
  
  if (!securityScan.passed) {
    issues.push(...(securityScan.vulnerabilities || []));
  }
  
  return issues;
}

function identifyPatterns(issues) {
  // 识别重复出现的问题模式
  const patternMap = new Map();
  
  for (const issue of issues) {
    const key = issue.description.split(' ').slice(0, 3).join(' ');
    patternMap.set(key, (patternMap.get(key) || 0) + 1);
  }
  
  return Array.from(patternMap.entries())
    .filter(([_, count]) => count >= 2)
    .map(([name, count]) => ({ name, count }));
}

async function writeStrategy(version, changes) {
  const content = `# Evolution Strategy v${version}\n\n## Changes\n\n${changes.join('\n')}`;
  await fs.writeFile(`memory/strategy/v${version}.md`, content);
}

async function updatePatterns(patterns) {
  // 更新模式库
  for (const pattern of patterns) {
    const filename = `memory/patterns/P${Date.now()}.md`;
    await fs.writeFile(filename, `# Pattern: ${pattern.name}\n\nOccurrences: ${pattern.count}`);
  }
}

async function logEvolution(log) {
  const filename = `memory/logs/${new Date().toISOString().split('T')[0]}-round-${log.round}.md`;
  await fs.writeFile(filename, JSON.stringify(log, null, 2));
}

async function generateFinalReport(round, strategy) {
  const report = `
# Evolution Final Report

**Rounds**: ${round}
**Final Strategy**: v${strategy.version}
**Task**: ${strategy.task}

## Summary

Evolution completed successfully.
`.trim();
  
  await fs.writeFile('EVOLUTION-REPORT.md', report);
}

// ============================================
// CLI 入口
// ============================================

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'evolve':
    const projectPath = args[1] || '.';
    const task = args.slice(2).join(' ') || 'Implement feature';
    await autonomousLoop(projectPath, { task });
    break;
  
  case 'generate':
    await generate(args[1] || '.', { version: 1.0, task: args[2] });
    break;
  
  case 'discriminate':
    await discriminate(args[1] || '.');
    break;
  
  case 'status':
    echo('GAN Evolution Engine v2.0');
    echo('Status: Ready');
    break;
  
  default:
    echo('🚀 GAN Evolution Engine v2.0');
    echo('\nUsage:');
    echo('  gan-evolution evolve [path] [task]  - Start autonomous evolution loop');
    echo('  gan-evolution generate [path]       - Run Generator once');
    echo('  gan-evolution discriminate [path]   - Run Discriminator once');
    echo('  gan-evolution status                - Show engine status');
}
