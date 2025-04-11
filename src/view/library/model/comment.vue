<template>
	<div class="commit-box">
		<div class="top-divider"></div>
		<div class="doc-info-box">
			<div class="create-by info-item">
				<img src="https://knowledge.bctools.cn/jvs-knowledge-ui/static/user-f3df3034.png" />
				<span>用户f132rr6</span>
			</div>
			<div class="create-time info-item">
				<ClockCircleFilled />
				<span>2023-05-16 10:00</span>
			</div>
			<div class="view info-item">
				<EyeFilled />
				<span>205</span>
			</div>
			<div class="info-item">
				<EditFilled />
				<span>编辑记录</span>
			</div>
		</div>
		<div class="start-box">
			<LikeOutlined style="font-size: 48px;color: #1e6fff;" />
		</div>
		<div class="traver-line">
			<span>若有收获，就点个赞吧</span>
		</div>
		<div class="start-users-boxs"></div>
		<div class="commit-lists"></div>
		<div class="input-box">
			<div class="input-placeholder-box">请输入评论内容</div>
		</div>
	</div>
</template>

<script lang="js" setup>
	import {
		EditFilled,
		EyeFilled,
		ClockCircleFilled,LikeOutlined
	} from '@ant-design/icons-vue'
</script>

<style scoped>
	.commit-box {
		padding: 16px 8px 16px 24px;
		box-sizing: border-box;
		width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
	}

	.commit-box .top-divider {
		border-top: 1px solid #eeeff0;
		margin-bottom: 16px;
	}

	.commit-box .doc-info-box {
		display: flex;
		align-items: center;
	}

	.commit-box .start-box {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 16px;
		margin-bottom: 16px;
	}

	.commit-box .traver-line {
		margin: 16px 0 !important;
		display: flex;
		justify-content: center;
		position: relative;
		font-size: 16px;
	}

	.commit-box .start-users-boxs {
		display: flex;
		justify-content: center;
		margin-top: 26px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.commit-box .input-box {
		height: 36px;
		min-height: 36px;
		background: #F5F6F7;
		border-radius: 4px;
		margin-top: 18px;
		border: 1px solid #f5f6f7;
		position: relative;
		transition: all .2s;
	}

	.hover-back {
		border-radius: 4px;
	}

	.commit-box .doc-info-box .create-by img {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		overflow: hidden;
		margin-right: 8px;
	}

	.commit-box .doc-info-box .info-item {
		display: flex;
		align-items: center;
		margin-right: 48px;
		gap: 12px;
		font-size: 14px;
		color: #6f7588;
	}

	.commit-box .start-box {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 16px;
		margin-bottom: 16px;
	}

	.commit-box .traver-line {
		margin: 16px 0 !important;
		display: flex;
		justify-content: center;
		position: relative;
		font-size: 16px;
	}

	.commit-box .traver-line:before {
		content: "";
		height: 1px;
		width: 400px;
		background-color: #eeeff0;
		position: absolute;
		left: 50%;
		transform: translate(-50%);
		top: 50%;
		z-index: 0;
	}

	.commit-box .traver-line span {
		color: #363b4c;
		z-index: 2;
		background-color: #fff;
		padding: 0 16px;
	}
	
	.input-placeholder-box{
	    cursor: pointer;
	    height: 36px;
	    line-height: 36px;
	    font-size: 14px;
	    color: #6f7588;
	    padding: 0 16px;
	    box-sizing: border-box;
	    z-index: 2;
	    position: relative;
	}
</style>