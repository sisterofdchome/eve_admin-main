<template>
	<div class="knowledge-info-top-tool">
		<div class="tool-left">
			<a-breadcrumb>
				<a-breadcrumb-item>全部文库</a-breadcrumb-item>
				<a-breadcrumb-item><a href="">文库-2</a></a-breadcrumb-item>
				<a-breadcrumb-item>An Application</a-breadcrumb-item>
			</a-breadcrumb>
		</div>
		<div class="tool-right">
			<div class="action-button hover-back">
				<TagOutlined class="tool-icon" />
				<span>收藏</span>
			</div>
			<div class="action-button hover-back">
				<FullscreenOutlined class="tool-icon" />
				<span>全屏</span>
			</div>
			<a-popover placement="bottom" trigger="click">
				<template #content>
					<div class="more-item more-item-top">
						<span class="more-icon">
							<LinkOutlined />
						</span>
						<span class="more-name">复制链接</span>
					</div>
					<div class="more-item more-item-top">
						<span class="more-icon">
							<DownloadOutlined />
						</span>
						<span class="more-name">文档下载</span>
					</div>
					<div class="more-item more-item-top">
						<span class="more-icon">
							<SettingOutlined />
						</span>
						<span class="more-name">文档设置</span>
					</div>
				</template>
				<div class="action-button hover-back">
					<EllipsisOutlined class="tool-icon" />
					<span>更多</span>
				</div>
			</a-popover>
	
			<div class="more-acitons-line"></div>
			<div class="more-actions">
				<a-popover placement="bottom">
					<template #content>
						文库信息
					</template>
					<div class="icon-box">
						<ReconciliationOutlined />
					</div>
				</a-popover>
				<a-popover placement="bottom">
					<template #content>
						协同人员
					</template>
					<div class="icon-box">
						<UsergroupAddOutlined />
					</div>
				</a-popover>
			</div>
		</div>
	</div>
</template>

<script lang="js" setup>
	import {
		BarsOutlined,
		DownloadOutlined,
		LinkOutlined,
		CopyOutlined,
		ImportOutlined,
		TagOutlined,
		BookOutlined,
		SettingOutlined,
		DeleteOutlined,
		FormOutlined,
		FullscreenOutlined,
		EllipsisOutlined,
		ReconciliationOutlined,
		UsergroupAddOutlined
	} from '@ant-design/icons-vue'
</script>

<style>
	.knowledge-info-top-tool {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 24px;
		height: 42px;
		margin-bottom: 8px;
		margin-left: 24px;
		width: calc(100% - 15px);
		padding-top: 10px;
	}
	.tool-left {
		display: flex;
		align-items: center;
	}
	
	.tool-right .action-button+.action-button {
		margin-left: 4px;
	}
	
	.tool-right {
		display: flex;
		align-items: center;
		word-break: keep-all;
	}
	
	.tool-right .hover-back {
		padding: 0 5px;
	}
	
	.tool-right .action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 32px;
		cursor: pointer;
	}
	.tool-right .more-acitons-line {
		width: 1px;
		height: 24px;
		background: #F0F1F2;
		margin-left: 16px;
	}
	
	.tool-right .tool-icon {
		cursor: pointer;
		margin-right: 2px;
		font-size: 18px !important;
		outline: none !important;
		display: flex;
		align-items: center;
	}
	
	.tool-right .action-button span {
		font-size: 12px;
		margin-left: 2px;
	}
	
	.more-actions {
		height: 32px;
		display: flex;
		align-items: center;
		padding: 0 7px 0 9px;
		margin-left: 7px;
	}
	
	.more-actions .icon-box {
		width: 30px;
		height: 30px;
		border-radius: 4px;
		cursor: pointer;
		background-color: #eeeff0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.more-actions .icon-box+.icon-box {
		margin-left: 10px;
	}
	
	.hover-back:hover {
		background: #F5F6F7 !important;
	}
	
	.more-item {
		padding: 0 16px 0 12px;
		cursor: pointer;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		color: #363b4c;
		font-weight: 500;
	}
	
	.more-item .more-icon {
		width: 16px;
		height: 16px;
		font-size: 16px;
		display: flex;
		align-items: center;
	}
	
	.more-item .more-name {
		flex: 2;
		margin-left: 8px;
	}
	
	.more-line {
		margin: 8px 0;
		background: #D7D8DB;
		height: 1px;
		width: 100%;
	}
	
	.more-items {
		padding: 8px 0;
		width: 140px;
	}
	
	.more-item:hover {
		background-color: #eeeff0;
	}
</style>